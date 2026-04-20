// user data (mock)
export const users = [
  {
    id: "1",
    name: "dashcode",
    email: "dashcode@codeshaper.net",
    password: "password",
    image: "/images/users/user-1.jpg",
  },
];

export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  image?: string;
};

// async เผื่ออนาคตใช้ DB
export const getUserByEmail = async (email: string): Promise<User | null> => {
  const user = users.find((user) => user.email === email);
  return user || null;
};