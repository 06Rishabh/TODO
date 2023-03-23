import { Button } from "react-bootstrap";

interface NavBarLoggedOutViewProps {
    onSignUpClicked: () => void,
    onLoginClicked: () => void,
}

const NavBarLoggedOutView = ({ onSignUpClicked, onLoginClicked }: NavBarLoggedOutViewProps) => {
    return (
        <>
            <Button onClick={onSignUpClicked} variant="dark">Sign Up</Button>
            <Button onClick={onLoginClicked} variant="dark">Log In</Button>
        </>
    );
}

export default NavBarLoggedOutView;