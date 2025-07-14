export interface DecodedToken extends User{
  iat: number;
  exp: number;
}

export interface User {
  readonly id: number;
  readonly name: string;
  readonly email: string;
}
export interface SplitDetail {
  id: number;
  email: string;
  amount: number;
}

export interface Expense {
  description: string;
  selectedGroup: string;
  amount: number;
  date: string;
  category: string;
  splitType: 'equal' | 'manual';
  splitDetails: SplitDetail[];
  paidBy: number;
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

export interface Settlement {
  fromId: number;
  toId: number;
  amount: number;
  groupId: number;
  status: "pending" | "settled";
  settledAt?: Date;
}
export interface DisplaySettlement extends Settlement {
  avatar: string;
  title: string;
  source: string;
}