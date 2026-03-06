export interface Spouse {
    id?: number;
    name: string;
    nid: string;
}

export interface Child {
    id?: number;
    name: string;
    dateOfBirth: string;
}

export interface Employee {
    id: number;
    name: string;
    nid: string;
    phone: string;
    department: string;
    basicSalary: number;
    spouse?: Spouse;
    children: Child[];
}

export interface CreateEmployeeDto {
    name: string;
    nid: string;
    phone: string;
    department: string;
    basicSalary: number;
    spouse?: Omit<Spouse, 'id'> | null;
    children: Omit<Child, 'id'>[];
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
    expiration: string;
}
