/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/exhaustive-deps */
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, } from "@firebase/firestore"
import { DotsHorizontalIcon } from "@heroicons/react/outline"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { db } from "../firebase"
import CommentsIcon from "@/svgs/CommentsIcon.svg"
import RetweetIcon from "@/svgs/RetweetIcon.svg"
import LikeFilledIcon from "@/svgs/LikeFilledIcon.svg"
import LikeOutlineIcon from "@/svgs/LikeOutlineIcon.svg"
import ActivityIcon from "@/svgs/ActivityIcon.svg"
import ShareIcon from "@/svgs/ShareIcon.svg"
import { useRecoilState } from "recoil"
import { modalState, threadIdState } from "../atoms/modalAtom"


function formatDurationInHours(startDate, endDate) {
    const durationInMilliseconds = endDate - startDate
    const durationInHours = durationInMilliseconds / (60 * 60 * 1000)
    return `${Math.round(durationInHours)}h`
}

function Comment({ id, comment }) {
    const { data: session } = useSession()
    const [ isOpen, setIsOpen ] = useRecoilState(modalState)
    const [ threadId, setThreadId ] = useRecoilState(threadIdState)
    const [ comments, setComments ] = useState([])
    const [ liked, setLiked ] = useState(false)
    const [ likes, setLikes ] = useState([])
    const [ retweeted, setRetweeted ] = useState(false)
    const [ retweets, setRetweets ] = useState([])



    const startDate = new Date("2023-08-29T12:00:00")
    const endDate = new Date("2023-08-29T16:00:00")
    const formattedDuration = formatDurationInHours(startDate, endDate)

    useEffect(() => onSnapshot(query(collection(db, "threads", id, "comments"), orderBy("timestamp", "desc")), (snapshot) => setComments(snapshot.docs)), [db, id])
    useEffect(() => onSnapshot(collection(db, "posts", id, "likes"), (snapshot) => setLikes(snapshot.docs)), [db, id])
    useEffect(() => onSnapshot(collection(db, "posts", id, "likes"), (snapshot) => setLikes(snapshot.docs)), [db, id])
    useEffect(() => setLiked(likes.findIndex((like) => like.id === session.user?.uid) !== -1), [likes])
    useEffect(() => onSnapshot(collection(db, "posts", id, "retweets"), (snapshot) => setRetweets(snapshot.docs)), [db, id])
    useEffect(() => setRetweeted(retweets.findIndex((retweet) => retweet.id === session.user?.uid) !== -1), [retweets])

    const likePost = async () => {
        if (liked) {
            await deleteDoc(doc(db, "posts", id, "likes", session.user.uid))
        } else {
            await setDoc(doc(db, "posts", id, "likes", session.user.uid), {
                username: session.user.name
            })
        }
    }

    const retweetPost = async () => {
        if (retweeted) {
            await deleteDoc(doc(db, "posts", id, "retweets", session.user.uid))
        } else {
            await setDoc(doc(db, "posts", id, "retweets", session.user.uid), {
                username: session.user.name
            })
        }
    }

    return (
        <div className="p-3 flex cursor-pointer border-b border-gray-700">
            <img src={comment?.userImg} alt="" className="h-11 w-11 rounded-full mr-4" />
            <div className="flex flex-col space-y-2 w-full">
                <div className="flex justify-between">
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className="font-bold text-[#d9d9d9] text-[15px] sm:text-base inline-block group-hover:underline">{comment?.username}</h4>
                            <span className="ml-1.5 text-sm sm:text-[15px]">@{comment?.tag}{" "}</span>
                        </div>
                        <span className="font-bold pr-2">{" "}·{" "}</span>
                        <span className="hover:underline text-sm sm:text-[15px]">{formattedDuration}</span>
                        <p className="text-[#d9d9d9] mt-0.5 max-w-lg text-[15px] sm:text-base">{comment?.comment}</p>
                    </div>
                    <div className="icon group flex-shrink-0"><DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" /></div>
                </div>
                <div className="text-[#6e767d] flex justify-between w-full">
                    <div className="flex items-center space-x-1 group"onClick={(e) => {e.stopPropagation(); setThreadId(id); setIsOpen(true)}}>
                        <div className="icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10"><CommentsIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                        {comments.length > 0 && <span className="group-hover:text-[#1d9bf0] text-sm">{comments.length}</span>}
                    </div>
                    <div className="flex items-center space-x-1 group" onClick={(e) => {e.stopPropagation(); retweetPost()}} >
                        <div className="icon group-hover:bg-pink-600/10"> 
                            <div className="icon group-hover:bg-green-500/10">
                                {retweeted ? (<RetweetIcon className="h-5 text-green-500"/>) : (<RetweetIcon className={`h-5 ${retweeted && "text-[#6e767d]"}`}/>)}
                            </div>
                        </div>
                        {retweets.length > 0 && (<span className={`h-5 group-hover:text-green-500 text-sm ${retweeted && "text-[#6e767d]"}`}>{retweets.length}</span>)}
                    </div>
                    <div className="flex items-center space-x-1 group" onClick={(e) => {e.stopPropagation(); likePost()}} >
                        <div className="icon group-hover:bg-pink-600/10"> 
                            {liked ? ( <LikeFilledIcon className="h-5 text-pink-600" />) : ( <LikeOutlineIcon className="h-5 group-hover:text-pink-600" />)}
                        </div>
                        {likes.length > 0 && (<span className={`group-hover:text-pink-600 text-sm ${liked && "text-pink-600"}`}>{likes.length}</span>)}
                    </div>
                    <div className="icon group"><ActivityIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                    <div className="icon group"><ShareIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                </div>
            </div>
        </div>
    )
}

export default Comment