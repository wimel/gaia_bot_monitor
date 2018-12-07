const Telegraf = require('telegraf')
const mongo = require('mongodb')
const util = require('util')
const exec = util.promisify(require('child_process').exec)


const MongoClient = require('mongodb').MongoClient, test = require('assert');

const DB_INFO = process.env.DB_INFO
const uri = "mongodb+srv://" + DB_INFO +"@cluster0-2etvy.gcp.mongodb.net/GaiaBotData";


const bot = new Telegraf(process.env.BOT_TOKEN)

const hexcosvaladdrpattern = RegExp(/[0-9A-F]{40}/)
const hexcosvaladdrpattern2 = RegExp(/[0-9A-F]{40}$/)

bot.start((ctx) => ctx.reply('Bienvenido'))
bot.help((ctx) => ctx.reply('Este es un bot que te notificará cuando algo suceda en la cadena Gaia. Para más información, visite https://github.com/forbole/gaia_bot_monitor'))
bot.on('sticker', (ctx) => ctx.reply('👍'))
bot.hears('hi', (ctx) => ctx.reply('Hola por ahí'))

async function run_cmd(command) {
    const {stdout, stderr} = await exec(command, { shell: true });

    if (stderr) {
        console.error(`error: ${stderr}`);
    }
    console.log(`addr: ${stdout}`)
    valaddr = stdout
    return valaddr
}

bot.command('/subscribe', async(ctx, next) => {
    var chatid = ctx.message.chat.id
    var text = ctx.message.text
    var texts = text.split(' ')
    valaddr = texts[1]

    if (typeof valaddr == 'undefined') {
        ctx.reply("Usage: /subscribe [hexvaladdress]")
    } else if (hexcosvaladdrpattern2.test(valaddr)) {

            valaddr = valaddr.replace(/\n/, '')
            MongoClient.connect(uri, function(err, client) {
                if(err) {
                    console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
                }
                console.log('Connected...');
                const collection = client.db("GaiaBotData").collection("ValAddrID");
                // perform actions on the collection object
                // check if this validator address is already subscribed
                var query = '{ "chatID": ' + chatid + ', "ValAddr": \"' + valaddr + '\" }'
                query = JSON.parse(query)
                collection.find(query).toArray(function(err, result) {
                    if (err) throw err;
                    if (result.length > 0) {
                        ctx.reply("You have already subscribed this validator")
                        client.close();
                    } else {
                    // if not yet subscribe, add it
                        collection.insertOne({chatID:chatid, ValAddr:valaddr, absent: false, slashed: false, revoked: false}, function(err, r) {
                            test.equal(null, err);
                            test.equal(1, r.insertedCount);
                            // Finish up test
                            client.close();

                            // reply user
                            ctx.reply("successfully subscribe " + valaddr)
                    });
                }
                })
            });
    } else {
        ctx.reply("Usage: /subscribe [hexvaladdress]")
    }
});

bot.command('/unsubscribe', async(ctx, next) => {
    var chatid = ctx.message.chat.id
    var text = ctx.message.text
    var texts = text.split(' ')
    valaddr = texts[1]

    if (typeof valaddr == 'undefined') {
        ctx.reply("Uso: /unsubscribe [hexvaladdress]")
    } else if (hexcosvaladdrpattern2.test(valaddr)) {

        valaddr = valaddr.replace(/\n/, '')
        MongoClient.connect(uri, function(err, client) {
            if(err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
            }
            console.log('Connected...');
            const collection = client.db("GaiaBotData").collection("ValAddrID");
            // perform actions on the collection object
            // check if this validator address is already subscribed
            var query = '{ "chatID": ' + chatid + ', "ValAddr": \"' + valaddr + '\" }'
            query = JSON.parse(query)
            collection.find(query).toArray(function(err, result) {
                if (err) throw err;
                if (result.length <= 0) {
                    ctx.reply("No estás suscrito a este validador aún")
                    client.close();
                } else {
                    // if not yet subscribe, add it
                    collection.remove(query, function(err, r) {
                        // Finish up test
                        client.close();
                        // reply user
                        ctx.reply("successfully unsubscribe " + valaddr)
                    });
                }
            })
        })
    } else {
        ctx.reply("Usage: /unsubscribe [hexvaladdress]")
    }
});

bot.command("/mute", async(ctx, next) => {
    var chatid = ctx.message.chat.id
    var text = ctx.message.text
    var texts = text.split(' ')
    valaddr = texts[1]
    type = texts[2]

    if (typeof valaddr == 'undefined' || typeof type == 'undefined') {
        ctx.reply("Uso: /mute [hexvaladdress] [absent|slashed|revoked]")
    } else if (type != "absent" && type != "slashed" && type != "revoked") {
        ctx.reply("Tipo erroneo. [absent|slashed|revoked]")
    } else if (hexcosvaladdrpattern.test(valaddr)) {

        valaddr = valaddr.replace(/\n/, '')

        // if validatoraddr exists in the db, change mute to true
        MongoClient.connect(uri, function(err, client) {
            if(err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
            }
            console.log('Connected...');
            const collection = client.db("GaiaBotData").collection("ValAddrID");

            var query = '{ "chatID": ' + chatid + ', "ValAddr": \"' + valaddr + '\" }'
            var newvalue = '{ "$set": {\"' + type + '\": true} }'
            newvalue = JSON.parse(newvalue)
            query = JSON.parse(query)

            if (collection.find(query)) {
                collection.updateOne(query, newvalue, function(err, res) {
                    if(err) throw err
                    console.log("updated")
                    ctx.reply("La address del validador " + valaddr + " está muteado en " + type)
                    client.close()
                });
            } else {
                ctx.reply("No estás suscrito al validador" + valaddr + " aún")
            }
        });
    } else {
        ctx.reply("Address de validador incorrecta, no puede ser muteada")
    }
})

bot.command("/unmute", async(ctx, next) => {
    var chatid = ctx.message.chat.id
    var text = ctx.message.text
    var texts = text.split(' ')
    valaddr = texts[1]
    type = texts[2]

    if (typeof valaddr == 'undefined' || typeof type == 'undefined') {
        ctx.reply("Uso: /unmute [hexvaladdress] [absent|slashed|revoked]")
    } else if (type != "absent" && type != "slashed" && type != "revoked") {
        ctx.reply("Tipo erroneo. [absent|slashed|revoked]")
    } else if (hexcosvaladdrpattern.test(valaddr)) {

        valaddr = valaddr.replace(/\n/, '')

        // if validatoraddr exists in the db, change mute to true
        MongoClient.connect(uri, function(err, client) {
            if(err) {
                console.log('Error occurred while connecting to MongoDB Atlas...\n',err);
            }
            console.log('Connected...');
            const collection = client.db("GaiaBotData").collection("ValAddrID");

            var query = '{ "chatID": ' + chatid + ', "ValAddr": \"' + valaddr + '\" }'
            var newvalue = '{ "$set": {\"' + type + '\": false} }'
            newvalue = JSON.parse(newvalue)
            query = JSON.parse(query)

            if (collection.find(query)) {
                collection.updateOne(query, newvalue, function(err, res) {
                    if(err) throw err
                    console.log("updated")
                    ctx.reply("La address del validador " + valaddr + " no está silenciada en tipo " + type)
                    client.close()
                });
            } else {
                ctx.reply("No ests suscrito al validador " + valaddr + " aún")
            }
        });
    } else {
        ctx.reply("Address de validador erronea, no puede ser silenciada")
    }
})

bot.command("/hack", async(ctx, next) => {
    var text = ctx.message.text
    var texts = text.split(' ')
    myinput = texts[1]

    if (typeof myinput == 'undefined') {
        ctx.reply("Uso: /hack [cosmosvaladdress]")
    } else if (cosvaladdrpattern.test(myinput)) {
        var cmd_debug = 'fbdebug addr ' + myinput + ' | grep Address | cut -d " " -f2'
        run_cmd(cmd_debug).then(function(result){
            hexaddr = valaddr.replace(/\n/, '')
            ctx.reply(hexaddr)
        })
//     } else if (hexcosvaladdrpattern.test(myinput)) {
// //        var cmd_debug = 'fbdebug addr ' + myinput + ' | grep Acc | cut -d " " -f3'
// //        run_cmd(cmd_debug).then(function(result){
// //            cosvaladdr = valaddr.replace(/\n/, '')
// //            ctx.reply(cosvaladdr)
// //        })
//         ctx.reply("No hex to addr for now.")
    } else {
        ctx.reply("Uso: /hack [cosmosvaladdress]")
    }
})

module.exports = bot;
