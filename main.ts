// main.ts - entry point

import * as dotenv from 'dotenv'
// import blue from '@atproto/api';

//import { BskyAgent } from '@atproto/api'


//dotenv.config()
import * as fs from 'fs';
import { BskyAgent, RichText } from '@atproto/api';
import * as tracery from 'tracery-grammar';


function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const flutterbotLoop = async() => {
    while (true) {
        hourlyLove();
        await sleep(1000);
    }
}

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
            'almost unbearable to think of',
            'really hard to even move sometimes'
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
        
    const agent = new BskyAgent({ service: "https://bsky.social" });
    
    await agent.login({
        identifier: process.env.FLUTTERBOT_LOGIN, password: process.env.FLUTTERBOT_APPKEY
    });
    
    const postRecord = {
        $type: 'did:plc:ljaamanauxkx2nejdkvf6sfb',
        text: postText,
    }
    
    await agent.post(postRecord);
        
    console.log(`Flutterbot Posted:\n ${postText} \n ----------`);
};

flutterbotLoop();
