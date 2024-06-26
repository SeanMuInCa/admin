import { defineStore } from 'pinia';
const useSPUStore = defineStore('SpuStore', {
  state: () => {
    return {
      spuName: '',
      tmId: '',
      id: '',
      category3Id: '',
      description: '',
      spuImageList: [],
      spuPosterList: [],
      spuSaleAttrList: [],
      spuAttrLeftList: [],
      allBrands: [],
      imgList: [],
      saleAttrList: [],
      baseAttrList: [],
    };
  },
  actions: {},
  getters: {},
});

export default useSPUStore;
