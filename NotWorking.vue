<template>
    <div class="my-brands-page">
        <!-- This shows the keys of the objects that get rendered, but it does not match the data shown in devtools. -->
        <div>{{ Object.keys(brands) }}</div>
    </div>
</template>

<script lang="ts">
export default defineComponent({
    name: 'MyBrandsPage',
    components: { BrandListItem },
    middleware: 'authenticated',
    setup() {
        const brandsStore = useBrandsStore();
        const { brands } = storeToRefs(brandsStore);
        // I attempted to include the following to get the delete changes reflected in the render to no avail.
        // The watcher is not even called when a brand is deleted. It is called when one is added though.
        // It feels a lot like the Vue 2 reactivity limitation that makes it impossible to react to deleted properties.
        // But, at least in theory, I should be replacing the value with a new object, not just deleting a property.
        // const instance = getCurrentInstance();
        // watch(
        //     brands,
        //     () => {
        //         console.log('watch brands');
        //         instance?.proxy.$nextTick(() => {
        //             instance.proxy.$forceUpdate();
        //         });
        //     },
        //     { deep: true }
        // );

        return {
            brandsStore,
            brands,
        };
    },
});
</script>
