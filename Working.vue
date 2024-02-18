<template>
    <div class="user-profile-page">
        <div>{{ Object.keys(brands) }}</div>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    name: 'UserProfilePage',
    components: { UserCredentialsSection, UserProfileSection },
    middleware: 'authenticated',
    setup() {
        const instance = getCurrentInstance();
        const handleData: DriverReactiveHandler<Brand> = ({
            data,
            loading: _loading,
        }) => {
            console.log('store handleData', data);
            brands.value = data;
            loading.value = _loading;
            // This is still required here to get the UI to render the keys. Without it, it just stays an empty array in the UI.
            instance?.proxy.$nextTick(() => {
                instance.proxy.$forceUpdate();
            });
        };
        const brandsDriver = new BrandsDriver(
            auth.currentUser?.uid || '',
            handleData
        );
        const brands = ref(brandsDriver.data);
        const loading = ref(brandsDriver.loading);

        auth.onAuthStateChanged((user) => {
            if (user) {
                brandsDriver.setUserId(user.uid);
                brandsDriver.subscribe();
            }
        });

        // Was just testing with data that I had created. This works: the UI is updated after deleting.
        const testDelete = () => {
            brandsDriver.delete('RJLPTFuTHFOLLVBnmXkB');
        };
        return {
            brands,
            loading,
            testDelete,
        };
    },
});
</script>