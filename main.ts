// main.ts - entry point
import * as fs from 'node:fs';
//import { BskyAgent, RichText, NotificationNS, AtpSessionEvent, AtpSessionData, AppBskyNotificationListNotifications as bskyNotifs, ComAtprotoServerCreateSession } from '@atproto/api';
import * as atp from '@atproto/api';
import { sprintf } from 'sprintf-js';
import * as tracery from 'tracery-grammar';
import * as ju from 'jsonutil';


function sleep(ms : number) {
return new Promise(resolve => setTimeout(resolve, ms));
}

async function flutterbotLoop(whichFunc : Function, sleepTime_ms : number)
{
    while (true) {
        whichFunc();
        await sleep(sleepTime_ms);
    }    
}

function convertToString(x: string) { return x; }


//const flutterbotLoop = async(whichFunc, sleepTime_ms) => {
//    while (true) {
//        whchFunc();
//        await sleep(sleepTime_ms);
//    }
//}

async function getPost(repository: string, repositoryKey: string, agent : atp.BskyAgent) : Promise<{ uri: string, cid: string, value: atp.AppBskyFeedPost.Record }>
{
    //agent.getAuthorFeed({ })
    return await agent.getPost({repo: repository, rkey: repositoryKey});
}

function extractKey(uri: string) : string
{
    return uri.substring(uri.lastIndexOf('/')+1);
}

function extractRepo(uri: string) : string
{
    uri = uri.replace("at://", "")
    return uri.substring(0, uri.indexOf("/"));
}



const checkFollows = async() => {
    var sessionData: atp.AtpSessionData = { accessJwt: "", refreshJwt: "", handle: "", did: "", email: ""};
    const agent = new atp.BskyAgent({
        service: "https://bsky.social",
        persistSession: (evt: atp.AtpSessionEvent, sess?: atp.AtpSessionData) => {
            // store the session-data for reuse
            sessionData = sess as atp.AtpSessionData;
        }
    });

    var login: string = process.env.FLUTTERBOT_LOGIN?.toString() ?? "";
    var appKey: string = process.env.FLUTTERBOT_APPKEY?.toString() ?? "";

    await agent.login({
        identifier: login,
        password: appKey
    });

    await agent.resumeSession(sessionData);
    
    var notifications: atp.AppBskyNotificationListNotifications.Response = await agent.listNotifications({
        limit: 100,
        cursor: ""
    });
    
    var cursor = notifications.data.cursor ?? "";
    //console.log(notifications);
    for (var i = 0; i < notifications.data.notifications.length; ++i)
    {
        console.log("[stringify] " + JSON.stringify(notifications.data.notifications[i]));
        var n = ju.deepCopy(notifications.data.notifications[i]);

        //var n: atp.AppBskyNotificationListNotifications.Notification = notifications.data.notifications[i];
        
        var repoKey : string;
        var repo : string;

        

        var externalPostUri = (n.reason == "mention") ? n.reasonSubject ?? "" : n.record.reply.root.uri ?? "";

            //console.log(`${n.reasonSubject} repoKey: ${repoKey} repo: ${repo}\n`);

        repoKey = extractKey(externalPostUri);
        repo = extractRepo(externalPostUri);

        var recordText : string = "";
        var myPost : atp.AppBskyFeedPost.Record = { did: "", text: "", createdAt: new Date().toString()};

        if (repo != "" && repoKey != "")
        {
           myPost = (await getPost(repo, repoKey, agent)).value;
           //console.log(JSON.stringify(myPost));
        }
        var postText: string = myPost.text.replace(/(\r\n|\n|\r)/gm, "");
   
        //console.log("--n.author---------------");
        //console.log(JSON.stringify(n.author));
        switch (n.reason)
        {
            case "follow":
                console.log(`follow: "${n.author.displayName}" @${n.author.handle} on ${n.indexedAt}`);
            break;
            case "like":
                console.log(`like: "${n.author.displayName}" @${n.author.handle} liked the post "${postText}"`);
            break;
            case "mention":
                console.log(`mention: "${n.author.displayName}" @${n.author.handle} mentioned us in post: "${postText}"`);
            break;
            case "quote":
                var otherPostText: string = n.record.text.replace(/(\r\n|\n|\r)/gm, "");              
                console.log(`quote: "${n.author.displayName}" @${n.author.handle} quoted our post: "${postText}":\n\t"${otherPostText}"`);
            break;
            case "reply":
                var otherPostText: string = n.record.text.replace(/(\r\n|\n|\r)/gm, "");
                console.log(`quote: "${n.author.displayName}" @${n.author.handle} replied to our post: "${postText}":\n\t"${otherPostText}"`);
            break;
            case "repost":
                console.log(`quote: "${n.author.displayName}" @${n.author.handle} reposted our post: "${postText}"`);
            break;
        };
    }
};

const updateFileName = "lastHourlyUpdate";
const hourlyLove = async () => {
    const lastUpdate = fs.readFileSync(updateFileName, 'utf-8');
    
    const lastUpdateTime_ms: number  = +lastUpdate;
    const currentTime_ms: number = new Date().getTime();
            
    var difference: number = currentTime_ms - lastUpdateTime_ms;
    
    const ms_in_an_hour = 3600000;
    
    // console.log(`${currentTime_ms} ${lastUpdateTime_ms}`);
    
    if (lastUpdate.length != 0 && difference <= ms_in_an_hour)
        return;
        
    console.log(`[${Date()}] flutterbot.hourlyUpdate: .`);
        
    fs.writeFileSync("lastHourlyUpdate", currentTime_ms.toString());
    
    var tracery = require('../tracery/tracery-grammar'); 
    var grammar = tracery.createGrammar({            
        'hardTimes' : [
            'it\'s been #intensifier# #hard# lately.',
            'so many people are #suffering#.',
            'people can\'t meet basic needs.',
            'bad people are hurting people on purpose.'            
        ],
        'suffering' : [
            'suffering',
            'not doing well',
            'hurting',
            'lonely',
            'isolated',
            'terrified for their future',
            'in ill health',
            'dealing with #chronicPain#'
        ],
        'chronicPain' : [
            'chronic pain',
            'chronic fatigue',
            'exhaustion',
            'weakness',
            'migraines',
            'extreme stress',
            'deep trauma'
        ],
        'hard' : [
            'rough',
            'hard',
            'difficult',
            'tough'
        ],
        'ken': [ 
            'know',
            'get',
            'feel that',
            'understand',
            'totally get',
            'very much know'
        ],
        'intensifier' : [ 
            'very much',
            'totally',
            'so much',
            'so totally',
            'completely',
            'so completely',
            'so very much',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
            '',
        ],
        'empathizeWithYou' : [
            '#intensifier# #ken# that #hardTimes#.'
        ],
        'wayTheWorldIs' : [
            'how things are right now',
            'been traumatic to many people',
            'awful to think of',
            'really hard to even move sometimes',
            'always a long exhausting day'
        ],
        'makeItBetter' : [
            'fix it',
            'make it better',
            'take care of things',
            'help people be okay'            
        ],
        'wishICould' : [
            '#intensifier# wish i could',
            '#intensifier# want to',
            'will try #intensifier# to',
        ],
        'lovesYouVeryMuch' : [
            'love you very much',
            'care about your well-being',
            'actually give a damn',
            'are trying to make a difference',
            'want you to have all the good things',
            'believe in a better future',
            'are going to make a difference, somehow'
        ],
        'thingToDo' : [
            'tell you that',
            'send our love',
            'spread our love around',
            'show you some affection',
            'give you love',
            'send out this message'
        ],
        'origin':[
            'I #empathizeWithYou#. It\'s #wayTheWorldIs#. I #wishICould# #makeItBetter#. \n'+
            '\n' +
            'We all #lovesYouVeryMuch#, and we just wanted to #thingToDo#.'
        ]
    });

    var longestPost: number = 0;
    
    var postText = grammar.flatten("#origin#\n");

    while (postText.includes("  "))
        postText = postText.replace(/  /gi, " ");
        
    const agent = new atp.BskyAgent({ service: "https://bsky.social" });
    
    await agent.login({
        identifier: process.env.FLUTTERBOT_LOGIN?.toString() ?? "", password: process.env.FLUTTERBOT_APPKEY?.toString() ?? ""
    });
    
    const postRecord = {
        $type: 'did:plc:ljaamanauxkx2nejdkvf6sfb',
        text: postText,
    }
    
    await agent.post(postRecord);
        
    console.log(`Flutterbot Posted:\n ${postText} \n ----------`);
};

const loadUsers = async() => {
    var sessionData: atp.AtpSessionData = { accessJwt: "", refreshJwt: "", handle: "", did: "", email: ""};
    const agent = new atp.BskyAgent({
        service: "https://bsky.social",
        persistSession: (evt: atp.AtpSessionEvent, sess?: atp.AtpSessionData) => {
            // store the session-data for reuse
            sessionData = sess as atp.AtpSessionData;
        }
    });

    var login: string = process.env.FLUTTERBOT_LOGIN?.toString() ?? "";
    var appKey: string = process.env.FLUTTERBOT_APPKEY?.toString() ?? "";

    await agent.login({
        identifier: login,
        password: appKey
    });

    
    var profileResponse: atp.AppBskyActorGetProfile.Response = await agent.getProfile({ actor: login });



    await agent.resumeSession(sessionData);
};



flutterbotLoop(loadUsers, 30000);
// flutterbotLoop(hourlyLove, 30000);
// flutterbotLoop(checkFollows, 30000);
