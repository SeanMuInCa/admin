<template>
  <div class="menulist" :class="{ dark: settingStore.darkMode }">
    <template v-for="item in menuList" :key="item.path">
      <template v-if="!item.children">
        <el-menu-item :index="item.path" v-if="item.meta.showInMenu" @click="goRoute">
          <el-icon :size="100">
            <component :is="item.meta.icon"></component>
          </el-icon>
          <template #title>
            <span>
              {{ item.meta.title }}
            </span>
          </template>
        </el-menu-item>
      </template>
      <template v-if="item.children && item.children.length === 1">
        <el-menu-item :index="item.path" v-if="item.children[0].meta.showInMenu" @click="goRoute">
          <el-icon :size="100">
            <component :is="item.children[0].meta.icon"></component>
          </el-icon>
          <template #title>
            <span>
              {{ item.children[0].meta.title }}
            </span>
          </template>
        </el-menu-item>
      </template>
      <template v-if="item.children && item.children.length > 1">
        <el-sub-menu :index="item.path" v-if="item.meta.showInMenu">
          <template #title>
            <el-icon :size="100">
              <component :is="item.meta.icon"></component>
            </el-icon>
            <span>{{ item.meta.title }}</span>
          </template>
          <Menu :menuList="item.children"></Menu>
          <!-- <el-menu-item v-for="(sub, i) in item.children" :key="sub.path" :index="index-i">{{sub.name}}</el-menu-item> 
              组件也能递归，卧槽，下面还要暴露一个-->
        </el-sub-menu>
      </template>
    </template>
  </div>
</template>

<script setup lang="ts" name="Menu">
import { router } from '@/router';
import useSettingStore from '@/store/modules/setting';
const settingStore = useSettingStore();
//假设从服务器上获取的路由列表
defineProps(['menuList', 'url']);
// let $router = useRoute()
const goRoute = (item: any) => {
  console.log(item.index);

  router.push(item.index);
};
</script>
<script lang="ts">
export default {
  name: 'Menu',
};
</script>

<style lang="scss" scoped>
.el-tooltip__trigger span {
  display: none;
}
.el-menu--collapse .el-submenu__title .el-submenu__icon-arrow {
  display: none;
}
.menulist {
  span {
    font-size: 16px;
  }
  .el-sub-menu {
    .el-menu {
      --el-menu-level: 1;
    }
  }
  &.dark {
    color: $white;
    background-color: $black;
  }
}

// .is-active {
//   background-color: orange;
//   color: #fff;
// }

.is-opened {
  //   background-color: #fff;
}
</style>
