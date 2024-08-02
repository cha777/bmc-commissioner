import pb from '@/lib/pocketbase';

const login = async (username: string, password: string) => {
  const authData = await pb.collection('users').authWithPassword(username, password);
  return authData;
};

const me = async () => {
  const authData = await pb.collection('users').authRefresh();
  return authData;
};

const logout = async () => {
  pb.authStore.clear();
};

export default {
  login,
  me,
  logout,
};
