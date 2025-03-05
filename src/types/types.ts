export interface User {
    _id:string;
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
}


export interface Leave{
    applicant: string;
    department: string;
    fromDate: Date;
    toDate: Date;
    reason: string;
    substituteSuggestion: {
        suggestedUser: string;
        suggestion: string;
    },
    actualLeaveDays: number;
}

export interface getUser {
    name: string;
    email: string;
    password: string;
    role: string;
    department: string;
    departmentName: string;
    
}


export interface LeaveDataProps {
    applicant: {
        name: string;
        email: string;
        role: string;
        department: string;
    };
    fromDate: string;
    toDate: string;
    reason: string;
    actualLeaveDays: number;
    substituteSuggestion: string;
    status: {
        hodApproval: { approved: boolean };
        principalApproval: { approved: boolean };
    };
}