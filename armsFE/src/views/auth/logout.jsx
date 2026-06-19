export default function Logout() {


    localStorage.removeItem('user');
    window.location.replace('/');



}