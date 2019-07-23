var sAudio = new Audio('/sound/success_sfx.mp3');
var eAudio = new Audio('/sound/error_sfx.mp3');
var Logs = new Vue({
    el: "#logs",
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
})
