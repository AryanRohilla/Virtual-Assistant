import React, { useContext, useEffect, useRef, useState } from 'react'
import { userDataContext } from '../context/userContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import aiImg from '../assets/ai.gif'
import userImg from '../assets/user.gif'
import {CgMenuRight} from "react-icons/cg"
import {RxCross1} from "react-icons/rx"

const Home = () => {

    const {userData, setUserData, serverUrl, getGeminiResponse} = useContext(userDataContext)
    const navigate = useNavigate()
    const [listening, setListening] = useState(false)
    const [userText, setUserText]= useState("")
    const [aiText,setAiText]=useState("")
    const isRecognizingRef=useRef(false)
    const isSpeakingRef = useRef(false)
    const recognitionRef = useRef(null)
    const synth = window.speechSynthesis
    const [ham,setHam] = useState(false)

    const handleLogOut=async()=>{
        try {
            const result = await axios.get(`${serverUrl}/api/auth/logout`,{withCredentials:true})
            setUserData(null)
            navigate("/signin")
        } catch (error) {
            setUserData(null)
            console.log(error)
        }
    }

    const startRecognition =()=>{

        if(!isSpeakingRef.current && !isRecognizingRef.current){
            try {
                recognitionRef.current?.start();
                console.log("Recognition requested to start");
            } catch (error) {
                if(error.name !== "InvalidStateError"){
                    console.error("Start error:", error);
                }
            }
        }
    }

    const speak = (text) => {
        if (!("speechSynthesis" in window)) {
            console.warn("Speech Synthesis not supported in this browser.");
        return;
        }

    console.log("Speaking:", text); // debug

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'hi-IN';
    const voices = window.speechSynthesis.getVoices()
    const hindiVoice = voices.find(v => v.lang === 'hi-IN');
    if(hindiVoice){
        utterance.voice=hindiVoice;
    }
    

    isSpeakingRef.current = true;

    utterance.onstart = () => {
        console.log("Speech started");
    };

    utterance.onend = () => {
        setAiText("")
        console.log("Speech ended");
        isSpeakingRef.current = false;
        setTimeout(()=>{
            startRecognition();
        },800);
    };

    // utterance.onerror = (e) => {
    //     console.error("Speech error:", e.error);
    //     isSpeakingRef.current = false;
    //     startRecognition();
    // };

    // VERY IMPORTANT: pehle queue clear karo
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
};

    const handleCommand=(data)=>{
        const {type,userInput, response}= data
        speak(response);

        if(type === 'google_search'){
            const query = encodeURIComponent(userInput);
            window.open(`https://www.google.com/search?q=${query}`,'_blank');
        }
        if(type === 'calculator_open'){

            window.open(`https://www.google.com/search?q=calculator`,'_blank');
        }
        if(type === 'instagram_open'){
            window.open(`https://www.instagram.com/`,'_blank');
        }
        if(type === 'facebook_open'){
            window.open(`https://www.facebook.com/`,'_blank');
        }
        if(type === 'weather_show'){

            window.open(`https://www.google.com/search?q=weather`,'_blank');
        }
        if(type === 'youtube_search' || type === 'youtube_play'){
            const query = encodeURIComponent(userInput)
            window.open(`https://www.youtube.com/results?search_query=${query}`,'_blank');
        }
    }

    useEffect(()=>{

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        const recognition = new SpeechRecognition()
        recognition.continuous = true,
        recognition.lang='en-US'
        recognition.interimResults=false;

        recognitionRef.current=recognition

        let isMounted = true;

        const startTimeout = setTimeout(()=>{
            if(isMounted && !isSpeakingRef.current && !isRecognizingRef.current){
                try {
                    recognition.start()
                    console.log("Recognition requested to start");
                } catch (e) {
                    if(e.name !== "InvalidError"){
                        console.log(e);
                    }
                }
            }
        },1000);


    //     const safeRecognition=()=>{
    //         if(!isSpeakingRef.current && !isRecognizingRef.current){
    //         try {
    //             recognition.start();
    //             console.log("Recognition requested to start");
    //         } catch (err) {
    //             if(err.name !== "InvalidStateError"){
    //                 console.error("Start error:", err);
    //             }
    //         }

    //     }
    // }

        recognition.onstart = () =>{
            console.log('Recognition started');
            isRecognizingRef.current = true;
            setListening(true);
        };

        recognition.onend=()=>{
            console.log("Recognition ended");
            isRecognizingRef.current=false;
            setListening(false);
            if(isMounted && !isSpeakingRef.current){
                setTimeout(()=>{
                    if(isMounted){
                        try {
                            recognition.start();
                            console.log("Recognition restarted");
                        } catch (e) {
                            if(e.name !== "InvalidStateError")
                            console.error(e);
                        }
                    }
                },1000)
            }
        }
    
        recognition.onerror = (event) =>{
            console.warn("Recognition error:", event.error);
            isRecognizingRef.current = false;
            setListening(false);
            if(event.error !== "aborted" && !isSpeakingRef.current && isMounted){
                setTimeout(()=>{
                    if(isMounted){
                        try {
                            recognition.start();
                            console.log("Recognition restarted after error")
                        } catch (e) {
                            if(e.name !== "InvalidStateError")
                                console.error(e);
                        }
                    }
                },1000);
            }
        }

        recognition.onresult = async(e)=>{
            const transcript = e.results[e.results.length-1][0].transcript.trim()
            console.log("heard : " + transcript)

            if(userData?.AssistantName && transcript.toLowerCase().includes(userData.AssistantName.toLowerCase())){

            setAiText("")
            setUserText(transcript)
            recognition.stop()
            isRecognizingRef.current=false
            setListening(false)
            const data = await getGeminiResponse(transcript)
            handleCommand(data)
            setAiText(data.response)
            setUserText("")
        }
    }

        const greeting = new SpeechSynthesisUtterance(`Hello ${userData.name}, what can I help you with`);
        greeting.lang='hi-IN'
        window.speechSynthesis.speak(greeting);

    return ()=>{
        isMounted=false;
        clearTimeout(startTimeout);
        recognition.stop()
        setListening(false)
        isRecognizingRef.current=false
        }
    }, [])





  return (
    <div className='w-full h-[100vh] bg-gradient-to-t from-[black] to-[#02023d] flex justify-center items-center flex-col gap-[15px] overflow-hidden'>

        <CgMenuRight className='lg:hidden text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(true)}/>
        <div className={`absolute lg:hidden top-0 w-full h-full bg-[#00000052] backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham?"translate-x-0":"translate-x-full"} transition-transform`}>
        <RxCross1 className=' text-white absolute top-[20px] right-[20px] w-[25px] h-[25px]' onClick={()=>setHam(false)}/>

        <button className='min-w-[150px] h-[60px] bg-white rounded-full text-black font-semibold text-[19px] cursor-pointer' onClick={handleLogOut}>Log Out</button>

        <button className='min-w-[150px] h-[60px] bg-white rounded-full  text-black font-semibold text-[19px] px-[20px] py-[10px] cursor-pointer' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

        <div className='w-full h-[2px] bg-gray-400'></div>
        <h1 className='text-white font-semibold text-[19px]'>History</h1>

        <div className='w-full h-[400px] gap-[20px] overflow-y-auto flex flex-col'>
            {userData.history?.map((his)=>(
                <span className='text-gray-200 text-[18px] truncate'>{his}</span>
            ))}
        </div>


        </div>

        <button className='min-w-[150px] h-[60px] bg-white rounded-full mt-[30px] text-black font-semibold text-[19px] absolute top-[20px] right-[20px] hidden lg:block cursor-pointer' onClick={handleLogOut}>Log Out</button>


        <button className='min-w-[150px] h-[60px] bg-white rounded-full mt-[30px] text-black font-semibold text-[19px] top-[100px] right-[20px] px-[20px] py-[10px] absolute hidden lg:block cursor-pointer' onClick={()=>navigate("/customize")}>Customize your Assistant</button>

        {/* DESKTOP: Right-side History Panel */}
        <div className='hidden lg:flex flex-col gap-[10px] absolute top-[200px] right-[20px] w-[280px] h-[60vh] bg-[#00000070] backdrop-blur-md rounded-2xl p-[15px] border border-gray-600'>
        <h2 className='text-white font-semibold text-[18px] mb-[5px]'>History</h2>
        <div className='w-full h-full overflow-y-auto flex flex-col gap-[10px]'>
          {userData?.history?.length ? (
            userData.history.map((his, idx) => (
              <span key={idx} className='text-gray-200 text-[14px] truncate'>
                {his}
              </span>
            ))
          ) : (
            <span className='text-gray-400 text-[14px]'>No history yet</span>
          )}
        </div>
      </div>


        <div className='w-[300px] h-[400p] flex justify-center items-center overflow-hidden rounded-4xl shadow-lg'>
            <img src={userData?.AssistantImage} alt="" className='h-full object-cover'/>

        </div>
        <h1 className='text-white text-[18px] font-semibold'> {userData?.AssistantName ? `I'm ${userData.AssistantName}` : "I'm your assistant"}</h1>

        {/* <button className="min-w-[200px] h-[50px] bg-white text-black rounded-full font-semibold text-[18px] absolute top-[20px] left-[20px] cursor-pointer" onClick={() => {
        // pehla interaction: speech + recognition dono yahi se
        speak(`Hi, I am your assistant ${userData?.AssistantName || ""}. How can I help you?`);
        // speech ke baad recognition anyway speak ke onend me startRecognition se resume hoga
        // agar tum turant bhi start karna chaho:
        startRecognition();}}>
        Start Assistant</button> */}
        

        {!aiText && <img src={userImg} alt="" className='w-[200px] '/> }
        {aiText && <img src={aiImg} alt="" className='w-[200px] '/> }

        <h1 className='text-white text-[18px] font-bold text-wrap'>{userText?userText:aiText?aiText:null}</h1>

    </div>
  )
}

export default Home
