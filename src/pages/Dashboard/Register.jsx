import { Link } from 'react-router-dom';

const Register = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <h1 className="text-3xl font-bold">Register</h1>
            <Link to="/" className="text-blue-500 hover:underline">Back to Login</Link>
        </div>
    );
};

export default Register;
