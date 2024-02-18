export const useBrandsStore = defineStore('brands', () => {
    const instance = getCurrentInstance();
    const handleData: DriverReactiveHandler<Brand> = ({
        data,
        loading: _loading,
    }) => {
        console.log('store handleData', data);
        brands.value = data;
        loading.value = _loading;
        // If I do not include this, the UI that relies on this data does not update, even though it shows the correct data in the devtools.
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

    const deleteBrand = async (brandId: string) => {
        const brand = brands.value[brandId];
        if (!brand) {
            return;
        }
        await brandsDriver.delete(brandId);
    };

    // Loads brands data after we get the logged in user.
    auth.onAuthStateChanged((user) => {
        if (user) {
            brandsDriver.setUserId(user.uid);
            brandsDriver.subscribe();
        }
    });

    return {
        brands,
        loading,
        deleteBrand,
    };
});
