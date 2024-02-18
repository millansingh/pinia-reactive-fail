import type {
    CollectionReference,
    QueryConstraint,
    UpdateData,
} from 'firebase/firestore';
import {
    deleteDoc,
    doc,
    getDocs,
    onSnapshot,
    query,
    setDoc,
    type Unsubscribe,
    updateDoc,
} from 'firebase/firestore';
// eslint-disable-next-line import/named
import { cloneDeep } from 'lodash';
import { EventBus } from './EventBus';
import type { WithId } from '~/types/frontend/firestore.ts';

type Data<T extends object> = Record<string, T>;

export type DriverReactiveHandler<T extends object> = ({
    data,
    loading,
}: {
    data: Data<T>;
    loading: boolean;
}) => void;

export type DriverEvents<T extends object> = {
    delete_document: WithId<T>;
    add_document: WithId<T>;
    update_document: WithId<T>;
};

export class FirestoreCollectionDriver<T extends object> {
    private collectionReference: CollectionReference<T>;
    data: Data<T>;
    loading: boolean;
    handler?: DriverReactiveHandler<T>;
    eventBus: EventBus<DriverEvents<T>>;

    constructor(
        collectionReference: CollectionReference<T>,
        handler?: DriverReactiveHandler<T>
    ) {
        this.data = {};
        this.collectionReference = collectionReference;
        this.loading = true;
        this.handler = handler;
        this.eventBus = new EventBus([
            'delete_document',
            'add_document',
            'update_document',
        ]);
    }

    // Using this method to pass updated data back to the place that initialized the component (in this case the store "handleData" function).
    private callHandler() {
        if (!this.handler) {
            return;
        }
        this.handler({ data: this.data, loading: this.loading });
    }

    // Fetches data from firestore and adds/updates it in data in here.
    // Also calls the handler function so the store can get updated values.
    subscribe(queries?: QueryConstraint[]): Unsubscribe | undefined {
        this.reset();
        const unsubscribe = query(this.collectionReference, ...(queries || []));
        return onSnapshot(unsubscribe, (snapshot) => {
            console.log('snapshot', snapshot.docChanges());
            snapshot.docChanges().forEach((change) => {
                if (change.type === 'added' || change.type === 'modified') {
                    this.data[change.doc.id] = change.doc.data();
                    this.eventBus.emit(
                        change.type === 'added'
                            ? 'add_document'
                            : 'update_document',
                        {
                            id: change.doc.id,
                            data: this.data[change.doc.id],
                        }
                    );
                } else if (change.type === 'removed') {
                    console.log('document removed');
                    const cloned = cloneDeep(this.data[change.doc.id]);
                    this.eventBus.emit('delete_document', {
                        id: change.doc.id,
                        data: cloned,
                    });
                    delete this.data[change.doc.id];
                }
            });
            console.log('post-snapshot data', this.data);
            this.loading = false;
            this.callHandler();
        });
    }

    async delete(docId: string) {
        // delete doc from firestore
        await deleteDoc(doc(this.collectionReference, docId));
        delete this.data[docId];
        this.callHandler();
    }

    reset() {
        this.data = {};
        this.loading = true;
        this.callHandler();
    }
}
