<!-- eslint-disable vue/no-unused-vars -->
<template>
  <div>
    <Category :showTable="showTable"></Category>
    <el-card style="margin: 10px 0">
      <div v-if="showTable">
        <el-button type="primary" icon="Plus" @click="handleAdd" :disabled="!categoryStore.c3_id">add an attribute</el-button>
        <el-table :data="categoryStore.list" style="width: 100%; margin: 20px 0" height="600" border v-loading="categoryStore.loading">
          <el-table-column fixed type="index" prop="index" label="No." width="100px" align="center" />
          <el-table-column prop="attrName" label="Attribute Name" width="300px"></el-table-column>
          <el-table-column prop="attrValueList" label="Attribute Value Name" width="700px" style="display: flex; justify-content: space-around">
            <template #default="{ row }">
              <div class="tags">
                <el-tag v-for="item in row.attrValueList" :key="item.id" :type="Math.random() > 0.5 ? 'success' : 'warning'">{{ item.valueName }}</el-tag>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="" label="Operation">
            <template #default="{ row }">
              <el-button type="warning" icon="Edit" @click="handleEdit(row)"></el-button>
              <el-popconfirm width="220" confirm-button-text="OK" cancel-button-text="No, Thanks" icon="InfoFilled" icon-color="#626AEF" title="Are you sure to delete this?" @confirm="deleteAttribute(row)">
                <template #reference>
                  <el-button type="danger" icon="Delete"></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>
      <div v-else>
        <el-form :inline="true">
          <el-form-item label="Attribute Name">
            <el-input placeholder="Input Attribute Name" v-model="AttributeObj.attrName"></el-input>
          </el-form-item>
        </el-form>
        <el-button type="primary" icon="Plus" :disabled="!AttributeObj.attrName" @click="handleNewAttrName">Add Attribute Value</el-button>
        <el-button @click="cancel">Cancel</el-button>
        <el-table border style="margin: 10px 0" :data="AttributeObj.attrValueList">
          <el-table-column label="No." width="100px" align="center" type="index"></el-table-column>
          <el-table-column label="Attribute Value">
            <template #default="{ row }">
              <div class="tags">
                <el-input v-model="row.valueName" v-show="edit == 1" :ref="handleFocus"></el-input>
                <div style="background-color: red; width: 100%" v-show="edit == 0">{{ row.valueName }}</div>
              </div>
            </template>
          </el-table-column>
          <el-table-column label="Operation">
            <template #default="{ row, $index }">
              <el-popconfirm width="220" confirm-button-text="OK" cancel-button-text="No, Thanks" icon="InfoFilled" icon-color="#626AEF" title="Are you sure to delete this?" @confirm="deleteAttrName(row, $index)">
                <template #reference>
                  <el-button type="danger" icon="Delete"></el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" :disabled="!AttributeObj.attrValueList.length" @click="confirmToSave">Confirm</el-button>
        <el-button @click="cancel">Cancel</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { watch, reactive, ref, onBeforeUnmount } from 'vue';
import useCategoryStore from '@/store/modules/category';
import type { attr, attrValue } from '@/api/production/type';
import { modifyAttr, deleteAttr } from '@/api/production/attribute';
import { ElMessage } from 'element-plus';
const showTable = ref<boolean>(true);
const categoryStore = useCategoryStore();
const edit = ref(1);
const AttributeObj = reactive<attr>({
  attrName: '',
  categoryId: '',
  categoryLevel: 3,
  attrValueList: [],
});

watch(
  () => categoryStore.c3_id,
  () => {
    //不能光保证改变，还得有值才能发请求
    if (categoryStore.c3_id) {
      getList();
      AttributeObj.categoryId = categoryStore.c3_id;
    }
  }
);
watch(
  () => categoryStore.c1_id,
  () => {
    categoryStore.c2_id = '';
    categoryStore.c3_id = '';
    categoryStore.c2Arr = [];
    categoryStore.c3Arr = [];
  }
);

watch(
  () => categoryStore.c2_id,
  () => {
    categoryStore.c3_id = '';
    categoryStore.c3Arr = [];
  }
);

watch(
  () => showTable.value,
  () => {
    if (!showTable.value) AttributeObj.categoryId = categoryStore.c3_id;
  }
);
const handleFocus = (element: any) => {
  element && element.focus();
};

const confirmToSave = async () => {
  let temp = AttributeObj.attrValueList.filter((item: attrValue) => item.valueName.trim().length === 0);
  if (temp.length === 0) {
    const data = await modifyAttr(AttributeObj);
    if (data.code == 200) {
      showTable.value = true;
      getList();
      ElMessage.success('new attribute ' + AttributeObj.id ? 'Edited' : 'added');
    } else ElMessage.error('failed to ' + AttributeObj.id ? 'Edited' : 'added' + ', try again');
  } else {
    ElMessage.error('no blank attribute name');
  }
};

const handleNewAttrName = () => {
  edit.value = 1;
  if (AttributeObj.attrValueList.length === 0) {
    AttributeObj.attrValueList.push({
      valueName: '',
    });

    return;
  }
  let temp = AttributeObj.attrValueList.filter((item: attrValue) => item.valueName.trim().length === 0);
  if (temp.length === 0) {
    AttributeObj.attrValueList.push({
      valueName: '',
    });
  } else {
    ElMessage.error('no blank attribute name');
  }
};

const deleteAttrName = (_row: any, index: number) => {
  AttributeObj.attrValueList.splice(index, 1);
};

const handleAdd = () => {
  if (categoryStore.c3_id) {
    showTable.value = false;
    AttributeObj.attrName = '';
    AttributeObj.attrValueList = [];
  }
};
const handleEdit = (row: attr) => {
  showTable.value = false;
  // AttributeObj.attrName = row.attrName;
  // AttributeObj.id = row.id;
  // AttributeObj.attrValueList = row.attrValueList;
  Object.assign(AttributeObj, JSON.parse(JSON.stringify(row))); //deep copy
};
const deleteAttribute = async (row: attr) => {
  console.log(row);
  const data = await deleteAttr(row.id as number);
  if (data.code == 200) {
    ElMessage.success('deleted');
  } else ElMessage.error('something went wrong, try again');
  getList();
};
const getList = async () => {
  await categoryStore.getList();
};

const cancel = () => {
  showTable.value = true;
  AttributeObj.attrName = '';
  AttributeObj.attrValueList = [];
  // console.log(AttributeObj);
  // getList();
};

onBeforeUnmount(() => {
  categoryStore.$reset();
});
</script>

<style scoped lang="scss">
body {
  margin: 0;
}

.example-showcase .el-loading-mask {
  z-index: 9;
}

.tags {
  display: flex;

  span {
    display: block;
    margin: 0 5px;
    line-height: 20px;
  }
}
</style>
