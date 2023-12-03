import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import { validate as validateEmail } from 'email-validator';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

let currentRequest: NodeJS.Timeout | null = null;

interface User {
    email: string;
    number?: string;
}

const users: User[] = [
    { email: 'jim@gmail.com', number: '221122' },
    { email: 'jam@gmail.com', number: '830347' },
    { email: 'john@gmail.com', number: '221122' },
    { email: 'jams@gmail.com', number: '349425' },
    { email: 'jams@gmail.com', number: '141424' },
    { email: 'jill@gmail.com', number: '822287' },
    { email: 'jill@gmail.com', number: '822286' }
];

const validateNumber = (number: string): boolean => {
    return /^\d{2}-\d{2}-\d{2}$/.test(number);
};

app.post('/search', async (req: Request, res: Response) => {
    if (currentRequest) {
        clearTimeout(currentRequest);
    }

    currentRequest = setTimeout(() => {
        const { email, number }: { email: string; number?: string } = req.body;

        if (!validateEmail(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }

        if (number && !validateNumber(number)) {
            return res.status(400).json({ error: 'Invalid number format. Expected XX-XX-XX' });
        }

        let filteredUsers: User[] = users.filter(user => user.email.includes(email));

        if (number) {
            const formattedNumber = number.replace(/\D/g, '');
            filteredUsers = filteredUsers.filter(user => user.number?.includes(formattedNumber));
        }

        res.json(filteredUsers);
        currentRequest = null;
    }, 5000);
});

const PORT = 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
