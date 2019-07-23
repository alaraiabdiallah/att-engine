var Login = new Vue({
    el: "#login",
    data: function(){
        return{
            username: '',
            password: '',
        }
    }, 
    methods: {
        login: function(event){
            let params = { username: this.username, password: this.password };
            window.fetch('/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal login";
            })
            .then(res => {
                localStorage.setItem("uid",res.uid);
                window.location.href="/";
            })
            .catch(e => alert(e))
        }
    },

})