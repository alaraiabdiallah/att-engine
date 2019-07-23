function checkAuth(){
    const uid = localStorage.getItem("uid");
    if(!uid)
        window.location.href="/lgn";
}

function logout(){
    localStorage.removeItem("uid");
    window.location.href = "/lgn";
}