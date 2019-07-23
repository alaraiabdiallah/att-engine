const Person = new Vue({
    el: "#person",
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
})