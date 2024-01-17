/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
import { collection, deleteDoc, doc, onSnapshot, orderBy, query, setDoc, } from "@firebase/firestore"
import { DotsHorizontalIcon, TrashIcon } from "@heroicons/react/outline"
import CommentsIcon from "@/svgs/CommentsIcon.svg"
import RetweetIcon from "@/svgs/RetweetIcon.svg"
import LikeFilledIcon from "@/svgs/LikeFilledIcon.svg"
import LikeOutlineIcon from "@/svgs/LikeOutlineIcon.svg"
import ActivityIcon from "@/svgs/ActivityIcon.svg"
import ShareIcon from "@/svgs/ShareIcon.svg"
import { useSession } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import { useRecoilState } from "recoil"
import { modalState, postIdState } from "../atoms/modalAtom"
import { db } from "../firebase"


function formatDurationInHours(startDate, endDate) {
    const durationInMilliseconds = endDate - startDate
    const durationInHours = durationInMilliseconds / (60 * 60 * 1000)
    return `${Math.round(durationInHours)}h`
}

function Post({ id, post, postPage }) {
    const { data: session } = useSession()
    const [ isOpen, setIsOpen ] = useRecoilState(modalState)
    const [ postId, setPostId ] = useRecoilState(postIdState)
    const [ comments, setComments ] = useState([])
    const [ liked, setLiked ] = useState(false)
    const [ likes, setLikes ] = useState([])
    const [ retweeted, setRetweeted ] = useState(false)
    const [ retweets, setRetweets ] = useState([])
    const router = useRouter()

    const startDate = new Date("2023-08-29T12:00:00")
    const endDate = new Date("2023-08-29T16:00:00")
    const formattedDuration = formatDurationInHours(startDate, endDate)


    useEffect(() => onSnapshot(query(collection(db, "posts", id, "comments"), orderBy("timestamp", "desc")), (snapshot) => setComments(snapshot.docs)), [db, id])
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
        <div className='p-3 flex cursor-pointer border-b border-gray-700 mx-5 px-2 py-2' onClick={() => router.push(`/${id}`)}>
            {!postPage && <img src={post?.userImg} alt='' className="h-11 w-11 rounded-full mr-4"/>}
            <div className="flex flex-col space-y-2 w-full">
                <div className={`flex ${!postPage && "justify-between"}`}>
                    {postPage && <img src={post?.userImg} alt='profile pic' className="h-11 w-11 rounded-full mr-4"/>}
                    <div className="text-[#6e767d]">
                        <div className="inline-block group">
                            <h4 className={`font-bold text-[15px] sm:text-base text-[#d9d9d9] group-hover:underline ${!postPage && "inline-block"}`}>{post?.username}</h4>
                            <span className={`text-sm sm:text-[15px] ${!postPage && "ml-1.5"}`}>@{post?.tag}</span>
                        </div>
                        <span className="font-bold">{" "}·{" "}</span>
                        <span className="hover:underline text-sm sm:text-[15px]">{formattedDuration}</span>
                        {!postPage && <p className="text-[#d9d9d9] text-[15px] sm:text-base mt-0.5 pb-2">{post?.text}</p>}
                    </div>
                    <div className="icon group flex-shrink-0 ml-auto">
                        <DotsHorizontalIcon className="h-5 text-[#6e767d] group-hover:text-[#1d9bf0]" />
                    </div>
                </div>
                {postPage && <p className="text-[#d9d9d9] text-[15px] sm:text-base mt-0.5 relative left-14">{post?.text}</p>}
                <img src={post?.image} alt="" className="rounded-2xl max-h-[700px] object-cover mr-2"/>
                <div className={`text-[#6e767d] flex justify-between w-full ${postPage && "mx-auto"}`}>
                    {!postPage && (
                        <div className="flex items-center space-x-1 group"onClick={(e) => {e.stopPropagation(); setPostId(id); setIsOpen(true)}}>
                            <div className="icon group-hover:bg-[#1d9bf0] group-hover:bg-opacity-10"><CommentsIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                            {comments.length > 0 && <span className="group-hover:text-[#1d9bf0] text-sm">{comments.length}</span>}
                        </div> )
                    }
                    {!postPage && ( 
                    <>
                        {session.user.uid === post?.id ? (
                            <div className="flex items-center space-x-1 group" onClick={(e) => {e.stopPropagation(); deleteDoc(doc(db, "posts", id)); router.push("/")}}>
                                <div className="icon group-hover:bg-red-600/10"><TrashIcon className="h-5 group-hover:text-red-600" /></div>
                            </div>
                            ) : (
                            <div className="flex items-center space-x-1 group" onClick={(e) => {e.stopPropagation(); retweetPost()}} >
                                <div className="icon group-hover:bg-pink-600/10"> 
                                    <div className="icon group-hover:bg-green-500/10">
                                        {retweeted ? (<RetweetIcon className="h-5 text-green-500"/>) : (<RetweetIcon className={`h-5 ${retweeted && "text-[#6e767d]"}`}/>)}
                                    </div>
                                </div>
                                {retweets.length > 0 && (<span className={`h-5 group-hover:text-green-500 text-sm ${retweeted && "text-[#6e767d]"}`}>{retweets.length}</span>)}
                            </div>
                            )
                        }
                    </>
                    )}
                    {!postPage && (
                        <div className="flex items-center space-x-1 group" onClick={(e) => {e.stopPropagation(); likePost()}} >
                            <div className="icon group-hover:bg-pink-600/10"> 
                                {liked ? ( <LikeFilledIcon className="h-5 text-pink-600" />) : ( <LikeOutlineIcon className="h-5 group-hover:text-pink-600" />)}
                            </div>
                            {likes.length > 0 && (<span className={`group-hover:text-pink-600 text-sm ${liked && "text-pink-600"}`}>{likes.length}</span>)}
                        </div>
                    )}
                    {!postPage && (
                        <div className="icon group"><ActivityIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                    )}
                    {!postPage && (
                        <div className="icon group"><ShareIcon className="h-5 group-hover:text-[#1d9bf0]" /></div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Post