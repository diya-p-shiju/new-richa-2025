import React, { useState, useEffect } from 'react';
import newRequest from '@/utils/newRequest';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User } from '@/types/types';


interface GetUserProps {
    onSelectUser: (userId: string) => void;
}

const GetUsers: React.FC<GetUserProps> = ({ onSelectUser }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await newRequest.get("/user/");
                console.log(response.data);
                setUsers(response.data);
            } catch (error) {
                console.log("error while fetching users", error);
            }
        };
        fetchUsers();
    }, []);

    const handleSelect = (userId: string) => {
        setSelectedUserId(userId);
        onSelectUser(userId); // Calling the parent callback with selected user ID
    };

    return (
        <div>
            <Select value={selectedUserId} onValueChange={handleSelect}>
                <SelectTrigger className="w-[280px]">
                    <SelectValue placeholder="Select a staff" />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        {users.map((user) => (
                            <SelectItem key={user._id} value={user._id}>
                                {user.name}
                            </SelectItem>
                        ))}
                    </SelectGroup>
                </SelectContent>
            </Select>
        </div>
    );
};

export default GetUsers;
