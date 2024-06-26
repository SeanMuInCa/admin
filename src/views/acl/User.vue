<template>
  <div>
    <el-card>
      <el-form inline style="display: flex; justify-content: space-between; align-items: center">
        <el-form-item label="User Name" label-width="" style="margin: auto 10px">
          <el-input placeholder="input a user's name to search" style="width: 300px" v-model="nameToSearch"></el-input>
        </el-form-item>
        <el-form-item style="margin: auto 10px">
          <el-button type="primary" @click="searchName" :disabled="!nameToSearch.trim().length">Search</el-button>
          <el-button @click="reset">Reset</el-button>
        </el-form-item>
      </el-form>
    </el-card>
    <el-card style="margin: 10px 0">
      <el-button type="primary" @click="handleAdd">Add One</el-button>
      <el-button type="warning" @click="massDelete" :disabled="!delList.length">Mass Delete</el-button>
      <el-table border style="margin: 20px 0" :data="userData" :show-overflow-tooltip="true" ref="tableRef" @selection-change="selectRow">
        <el-table-column type="selection" width="50"></el-table-column>
        <el-table-column type="index" label="No." width="80" align="center"></el-table-column>
        <el-table-column label="User Id" width="80" prop="id" align="center"></el-table-column>
        <el-table-column label="User Name" width="140" prop="username"></el-table-column>
        <el-table-column label="Nick Name" width="140" prop="name"></el-table-column>
        <el-table-column label="User Role" width="340" prop="roleName"></el-table-column>
        <el-table-column label="Created Time" width="200" prop="createTime"></el-table-column>
        <el-table-column label="Last Update" width="200" prop="updateTime"></el-table-column>
        <el-table-column label="Operation">
          <template #default="{ row }">
            <el-button type="primary" icon="User" size="small" @click="assignRole(row)">Assign Role</el-button>
            <el-button type="warning" icon="Edit" size="small" @click="editUser(row)">Edit User</el-button>
            <el-popconfirm width="220" confirm-button-text="OK" cancel-button-text="No, Thanks" icon="InfoFilled" icon-color="#626AEF" title="Are you sure to delete this?" @confirm="confirmDel(row)">
              <template #reference>
                <el-button type="danger" icon="Delete" size="small">Delete</el-button>
              </template>
            </el-popconfirm>
          </template>
        </el-table-column>
      </el-table>
      <div class="demo-pagination-block">
        <div class="demonstration"></div>
        <el-pagination
          v-model:current-page="currentPage"
          v-model:page-size="pageSize"
          :page-sizes="[5, 10, 15]"
          :background="true"
          layout="prev, pager, next, jumper,->,sizes,total"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="getData"
        />
      </div>
      <el-drawer v-model="openDrawer" :title="userParams.id ? 'Edit a user' : 'Add a user'" direction="rtl" size="30%">
        <template #default>
          <el-row :gutter="20">
            <el-col :span="6">
              <div style="line-height: 30px">Nick Name:</div>
            </el-col>
            <el-col :span="16">
              <el-input v-model="userParams.name"></el-input>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <div style="line-height: 30px">UserName:</div>
            </el-col>
            <el-col :span="16">
              <el-input v-model="userParams.username" @blur="checkUsername"></el-input>
            </el-col>
          </el-row>
          <el-row :gutter="16" v-show="!userParams.id">
            <el-col :span="6">
              <div style="line-height: 30px">Password:</div>
            </el-col>
            <el-col :span="16">
              <el-input v-model="userParams.password" type="password" @blur="checkPassword"></el-input>
            </el-col>
          </el-row>
          <el-button type="primary" @click="confirmAdd">Confirm</el-button>
          <el-button @click="cancelAdd">Cancel</el-button>
        </template>
      </el-drawer>
    </el-card>
    <!-- assign role -->
    <el-drawer title="Assign roles" size="30%" v-model="showAssign">
      <template #default>
        <el-form label-width="100">
          <el-form-item label="User Name: ">
            <el-input disabled v-model="userParams.username"></el-input>
          </el-form-item>
          <el-form-item label="Roles: ">
            <el-checkbox v-model="checkAll" :indeterminate="isIndeterminate" @change="handleCheckAllChange">Check all</el-checkbox>
            <el-checkbox-group v-model="assignedRoleList" @change="handleCheckedRolesChange">
              <el-checkbox v-for="role in allRolesList" :key="role.id" :value="role" :label="role">
                {{ role.roleName }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </el-form>
      </template>
      <template #footer>
        <el-button type="primary" @click="confirmAssign">Confirm</el-button>
        <el-button @click="handleCancel">Cancel</el-button>
      </template>
    </el-drawer>
  </div>
</template>

<script setup lang="ts">
import { getAllUsers, modifyUser, massDel, delUser, getRoleList, assignToRole } from '@/api/acl/user';
import { ref, onMounted } from 'vue';
import type { userRecordsType, UserListReturnType, roleListType, role } from '@/api/acl/type';
import { ElMessage } from 'element-plus';

const checkAll = ref(false);
const isIndeterminate = ref(true);
const currentPage = ref(1);
const pageSize = ref(5);
const total = ref(0);
const userData = ref<userRecordsType[]>([]);
const userParams = ref<userRecordsType>({
  id: '',
  name: '',
  username: '',
  password: '',
});
const openDrawer = ref<boolean>(false);
const nameToSearch = ref<string>('');
const tableRef = ref<any>();
const delList = ref<userRecordsType[]>([]);
const username = ref(false); //shit i should use form
const password = ref(false);
const showAssign = ref<boolean>(false);
const allRolesList = ref<role[]>([]);
const assignedRoleList = ref<role[]>([]);
const checkUsername = () => {
  if (userParams.value.username.length < 5) {
    ElMessage.error('username at least 5');
    username.value = false;
  } else {
    username.value = true;
  }
};
const checkPassword = () => {
  if (/^[a-z0-9_-]{6,12}$/.test(userParams.value.password)) {
    password.value = true;
  } else {
    ElMessage.error('password need 6 to 12');
    password.value = false;
  }
};
const getData = async (pager = 1) => {
  currentPage.value = pager;
  const data: UserListReturnType = await getAllUsers(currentPage.value, pageSize.value);
  if (data.code == 200) {
    total.value = data.data.total;
    userData.value = data.data.records;
  }
};

onMounted(() => {
  getData();
});
const handleSizeChange = async () => {
  currentPage.value = 1;
  await getData();
};
const handleAdd = () => {
  openDrawer.value = true;
  userParams.value = {
    id: '',
    name: '',
    username: '',
    password: '',
  };
};
const cancelAdd = () => {
  openDrawer.value = false;
  userParams.value = {
    id: '',
    name: '',
    username: '',
    password: '',
  };
};
const confirmAdd = async () => {
  const data = await modifyUser(userParams.value);
  if (data.code == 200) {
    ElMessage.success(userParams.value.id ? 'edit success' : 'added success');
    openDrawer.value = false;
    getData(userParams.value.id ? currentPage.value : 1);
  } else {
    ElMessage.error('something went wrong');
  }
};

const searchName = () => {
  if (nameToSearch.value.trim()) {
    userData.value = userData.value.filter((item: userRecordsType) => item.name.includes(nameToSearch.value));
    nameToSearch.value = '';
  } else getData();
};
const reset = () => {
  nameToSearch.value = '';
  getData();
};

const massDelete = async () => {
  let idList: number[] = delList.value.map((item: userRecordsType) => {
    return item.id as number;
  });
  if (idList.length > 0) {
    const data = await massDel(idList);
    if (data.code == 200) {
      ElMessage.success('deleted!');
      getData(currentPage.value);
    } else {
      ElMessage.error('something went wrong');
      getData();
    }
  }
};
const selectRow = (data: userRecordsType[]) => {
  delList.value = data;
};

const confirmDel = async (row: userRecordsType) => {
  const data = await delUser(row.id as number);
  if (data.code == 200) {
    ElMessage.success('deleted!');
  } else {
    ElMessage.error('something went wrong');
  }
  getData(currentPage.value);
};

const editUser = (row: userRecordsType) => {
  userParams.value = row;
  openDrawer.value = true;
};

const assignRole = async (row: userRecordsType) => {
  userParams.value = row;
  const data: roleListType = await getRoleList(row.id as number);
  if (data.code == 200) {
    allRolesList.value = data.data.allRolesList;
    assignedRoleList.value = data.data.assignRoles;
  }
  showAssign.value = true;
};

const handleCheckAllChange = (val: boolean) => {
  assignedRoleList.value = val ? allRolesList.value : [];
  isIndeterminate.value = false;
};

const handleCheckedRolesChange = (value: role[]) => {
  const checkedCount = value.length;
  checkAll.value = checkedCount === allRolesList.value.length;
  isIndeterminate.value = checkedCount > 0 && checkedCount < allRolesList.value.length;
};
const confirmAssign = async () => {
  const assignRoleData = {
    userId: userParams.value.id,
    roleIdList: assignedRoleList.value.map((item: role) => item.id),
  };
  const data = await assignToRole(assignRoleData);
  if (data.code == 200) {
    ElMessage.success('assign success');
    showAssign.value = false;
    getData(currentPage.value);
  } else {
    ElMessage.error('something went wrong');
  }
};
const handleCancel = () => {
  showAssign.value = false;
};
</script>

<style scoped>
.demo-pagination-block + .demo-pagination-block {
  margin-top: 10px;
}

.demo-pagination-block .demonstration {
  margin-bottom: 16px;
}

.el-row {
  margin-bottom: 20px;
}

.el-row:last-child {
  margin-bottom: 0;
}

.el-col {
  border-radius: 4px;
}
</style>
