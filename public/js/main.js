var socket = io('//');

window.attFlag;

socket.on('tap', function(data){
    console.log(data);
});

var sAudio = new Audio('/sound/success_sfx.mp3');
var eAudio = new Audio('/sound/error_sfx.mp3');

function checkAuth(){
    const uid = localStorage.getItem("uid");
    if(!uid)
        window.location.href="/lgn";
}

function logAtt(id,callback){
    return new Promise((resolve,reject) => {
        window.fetch('/person/'+id+'/logs').then(res => res.json())
        .then(res =>{
            if(res.success == true)
                return resolve(res);
            else
                return reject("something wrong");
        })
        .then(callback).catch(() => reject("Something wrong"));
    })
}

const Login = {
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
                window.location.href="/#/";
            })
            .catch(e => alert(e))
        }
    },
    template: `<div>
        <label>Username : <input v-model="username"></label><br />
        <label>Password : <input v-model="password" type="password"></label><br />
        <button type="button" v-on:click="login">Login</button>
    </div>` 
}
const Person = {
    data: function(){
        return{
            isEdit:false,
            people: [],
            uuid: '',
            name: '',
            id: 0,
        }
    }, 
    methods: {
        getPeople: function(){
            window.fetch('/people').then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal Mengambil Data";
            }).then((res) => this.people = res)
            .catch(e => alert(e))
        },

        getPerson: function(id){
            this.isEdit = true;
            window.fetch('/person/'+id)
            .then(res => {
                if(res.status == 200) 
                    return res.json();
                throw "Error";
            })
            .then((data) => {
                this.uuid = data.uuid;
                this.name = data.name;
                this.id = data.id;
            })
            .catch(e => {
                console.error(e);
            })
        },
        insertPerson: function(){
            let params = { uuid: this.uuid, name: this.name };
            window.fetch('/person',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal save data";
            })
            .then(res => {
                if(res.success)
                    alert('Berhasil save data')
                this.getPeople()
            })
            .catch(e => alert(e))
        },

        updatePerson: function(){
            let params = { uuid: this.uuid, name: this.name, id:this.id };
            window.fetch('/person',{
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(params)
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal save data";
            })
            .then(res => {
                if(res.success)
                    alert('Berhasil save data')
                this.uuid = "";
                this.name = "";
                this.id = "";
                this.isEdit = false;
                this.getPeople()
            })
            .catch(e => alert(e))
        },
        deletePerson: function(id){
            window.fetch('/person/'+id,{
                method: 'DELETE',
            }).then(res => {
                if(res.status == 200)
                    return res.json();
                throw "Gagal delete data";
            })
            .then(res => {
                if(res.success)
                    alert('Berhasil Delete data')
                this.getPeople()
            })
            .catch(e => alert(e))
        },
        inputChange: function(data){
            this.uuid = data.uuid
        }
    },
    mounted(){
        checkAuth();
        var t = this;
        t.getPeople();
        window.attFlag = "person-data"
        socket.on('tap', function(data){
            if(window.attFlag == "person-data")
                t.inputChange(data);
        });
    },
    template: `
        <div>
            <a href="/#/">Back</a><br />
            <table border="1" v-if="people.length > 0">
                <tr>
                    <td>No</td>
                    <td>UUID</td>
                    <td>Name</td>
                    <td>action</td>
                </tr>
                <tr v-for="(item, index) in people">
                    <td>{{ index + 1 }}</td>
                    <td>{{ item.uuid }}</td>
                    <td>{{ item.name }}</td>
                    <td>
                        <button type="button" v-on:click="getPerson(item.uuid)">Update</button>
                        <button type="button" v-on:click="deletePerson(item.id)">Delete</button>
                    </td>
                </tr>
            </table>
            <input type="hidden" v-model="id">
            <label>UUID : <input v-model="uuid" :readonly="isEdit"></label><br />
            <label>Name : <input v-model="name"></label><br />
            <button type="button" v-on:click="insertPerson" v-if="!isEdit">Add</button>
            <button type="button" v-on:click="updatePerson" v-if="isEdit">Update</button>
        </div>
    `
}

const Logs = {
    data: function(){
        return{
            logs:[],
        }
    }, 
    methods: {
        getPerson: function(id){
            window.fetch('/person/'+id)
            .then(res => {
                if(res.status == 200) 
                    return res.json();
                throw "Error";
            })
            .then((data) => {
                return logAtt(id,(res) => {
                    sAudio.play();
                    this.getLogs();
                });
            })
            .catch(e => {
                eAudio.play();
                console.error(e);
            })
        },

        getLogs: function(){
            window.fetch('/att_logs')
            .then(res => res.json())
            .then((res) => this.logs = res)
            .catch(console.error);
        },
    },
    mounted(){
        checkAuth();
        var t = this;
        window.attFlag = "att_logs";
        this.getLogs();
        socket.on('tap', function(data){
            if(window.attFlag == "att_logs")
                t.getPerson(data.uuid);
        });
    },
    beforeDestroy(){
        console.log("before Destroy");
    },
    template: `
        <div>
            <a href="/#/">Back</a><br />
            <h2>Logs</h2>
            <ul>
            <li v-for="log in logs">
                {{ log.name }} did attendance at {{ new Date(log.log_time) }}
            </li>
            </ul>
        </div>
    `
}

const Home = {
    methods:{
        logout: function(){
            console.log("Logout!")
            localStorage.removeItem("uid");
            window.location.href = "/#/login";
        },
        movePage: function(link){
            window.location.href = link;
            window.location.reload();
        }
    },
    mounted(){
        window.attFlag = undefined;
        checkAuth();
    },
    template: `
        <div>
            <h2>Menu</h2>
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="movePage('/#/person')">Person</button> | 
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="movePage('/#/logs')">Att logs</button> |
            <button style="cursor:pointer;color: blue;background:none;border:none;" v-on:click="logout">Logout</button> |
        </div>
    `
}

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/person', component: Person },
  { path: '/logs', component: Logs },
]

const router = new VueRouter({
  routes // short for `routes: routes`
})

const app = new Vue({
    el: '#app',
    mounted(){
        socket.on('connect', function(){
            console.log("connected");
        });
    },
    router
})
