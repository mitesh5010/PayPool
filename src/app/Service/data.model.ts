export interface DecodedToken {
  user: {
    id: number;
    email: string;
    password: string;
    name: string;
  };
  iat: number;
  exp: number;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}

export interface Expense {
  description: string;
  selectedGroup: string;
  amount: number;
  date: string;
  category: string;
  splitType: 'equal' | 'manual';
  selectedMembers: string[];
}

export interface Category{
  category:string;
  id:number;
}

export interface Group {
  id?:number;
  name:string;
  description:string;
  status:'ACTIVE' | 'SETTLED';
  userId:number;
  members:User[];
  total:number;
  youOwe:number; 
  owedToYou:number;
}