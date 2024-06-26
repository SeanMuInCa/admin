import axiosRequest from '@/utils/request';
import type { UserListReturnType, userRecordsType, roleListType } from './type';
enum API {
  GET_ALL_USERS = '/admin/acl/user/',
  ADD_USER = '/admin/acl/user/save',
  UPDATE_USER = '/admin/acl/user/update',
  MASS_DEL = '/admin/acl/user/batchRemove',
  DEL_USER = '/admin/acl/user/remove/',
  GET_ROLE_LIST = '/admin/acl/user/toAssign/',
  ASSIGN_ROLE = '/admin/acl/user/doAssignRole',
}

export const getAllUsers = (page: number, limit: number) => axiosRequest.get<any, UserListReturnType>(API.GET_ALL_USERS + `${page}/${limit}`);
export const modifyUser = (data: userRecordsType) => (data.id ? axiosRequest.put<any, any>(API.UPDATE_USER, data) : axiosRequest.post<any, any>(API.ADD_USER, data));
export const massDel = (data: number[]) => axiosRequest.delete<any, any>(API.MASS_DEL, { data: data }); //这个传参不一样
export const delUser = (id: number) => axiosRequest.delete<any, any>(API.DEL_USER + id);
export const getRoleList = (id: number = 1) => axiosRequest.get<any, roleListType>(API.GET_ROLE_LIST + id);
export const assignToRole = (data: any) => axiosRequest.post<any, any>(API.ASSIGN_ROLE, data);
