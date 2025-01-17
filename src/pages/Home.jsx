import React, { Profiler, useEffect, useRef, useState } from 'react'
import Loading from '../components/Loading'
import { BsFiletypeGif, BsPersonFillAdd, BsPostcard } from "react-icons/bs";
import { BiImages, BiSolidVideo } from "react-icons/bi";
import NavBar from '../components/NavBar';
import NoProfile from '../assets/defaultProfile.jpg'
import PostCard from '../components/PostCard';
import CoverImage from '../assets/coverImage.jpg'
import { IoMdAdd } from 'react-icons/io';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/apiIntercepeors';
import { handleFileUpload } from '../utils/ImageUploading';
import Pagination from '@mui/material/Pagination';
import Stack from '@mui/material/Stack';
import ProfileModal from '../components/ProfileModal';
import ContriesModal from '../components/ContriesModal';
import FilterModal from '../components/FilterModal';

const Home = () => {
    const [posting, setPosting] = useState(false);
    const [loading, setloading] = useState(false);
    const [errMsg, setErrMsg] = useState("");
    const [posts,setPosts]=useState()
    const [users,setUser]=useState([])
    const [file, setFile] = useState(null);
    const descriptionRef=useRef(null)
    const [totalPage,setTotalPage]=useState(0)
    const [page,setPage]=useState(1)
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const[cureentUser,setCurentUSer]=useState({})
    const[modalIsOpenContries,setModalIsOpenContries]=useState(false)
    const [countriesCode,setConutriesCode]=useState([])
    const [countries,setCountries]=useState([])
    const [filter,setFilter]=useState()
    const [search,setSearch]=useState()
    const[isOpen,setIsOpen]=useState(false)
    const [locations,setLocations]=useState([])
    const [selectLocation,setSelecteLocation]=useState()
    const navigate=useNavigate()

    const fetchPost=async()=>{
      try {
        setloading(true)
        const response =await api.get('/post/',{params:{page,search,filter}})
        setloading(false)
        if(response.status==200){
          setPosts(response.data.data)
            setTotalPage(response.data.totalpage)
        }
      } catch (error) {
        console.error(error);
        setErrMsg('')
      }
    }
    const countriesFetching=async()=>{
      try {
        if(countriesCode.length>0){
          setloading(true)
        const response=await api.get('/countries/',{params:{countriesCode}})
        setloading(false)
        setCountries(response.data.data)
        }
      } catch (error) {
        console.error(error)
      }
    }
    useEffect(()=>{
      const token=localStorage.getItem('token')
      if(!token){
        navigate('/login')
      }
        const usersFetching=async()=>{
            setloading(true)
            const response=await api.get('/users/')
            setloading(false)
            setUser(response?.data?.data)
        }
        const currentUserFetching=async()=>{
          setloading(true)
          const response=await api.get('/users/',{params:{userId:localStorage.getItem('userId')}})
          setloading(false)
          setCurentUSer(response?.data?.data)
          setConutriesCode(response.data.data.interested_countries)
        }
        const locationsFetching=async()=>{
          setloading(true)
          const response=await api.get('/countries/')
          setLocations(response.data.data);
        }
        
        currentUserFetching()
        usersFetching()
        fetchPost()
        countriesFetching()
        locationsFetching()
    },[page,filter,search])
     
    const handleSelectChange = (event) => {
      setSelecteLocation(event.target.value);
    };

    const handleImageUpload=(event)=>{
        const file =event.target.files[0];
        setFile(file)
    };
    const handlePostSubmit= async (event)=>{
      event.preventDefault();
        setPosting(true)
        setErrMsg('')
        try {
          let uri;
          if(file){
            setloading(true)
            const value=await handleFileUpload(file)
             uri=file&&value
          }
            const user_id=localStorage.getItem('userId')
            const description = descriptionRef.current.value;
            const newData={selectLocation,description,user_id,...(uri&&{image:uri})};
            const response=await api.post('/post/',newData)
            setloading(false)
            if(response.status!=200){
              setErrMsg(response)
            }else{
              if(descriptionRef.current){
                descriptionRef.current.value = "";
                fetchPost()
              }
              setFile(null);
              setErrMsg("");
            }
            setPosting(false)
        } catch (error) {
            console.error(error);
            setPosting(false)
        }
    }
    const handleChange = (e, value) => {
      setPage(value);
    };

  return (
    <div className={`home w-full px- lg:px-10 pb-20 2xl:px-40 bg-secondary bg-opacity-40 lg:rounded-lg h-screen overflow-hidden`}>
      {/* {loading&&<Loading/>} */}
      {modalIsOpen&&<ProfileModal modalIsOpen={modalIsOpen} setModalIsOpen={setModalIsOpen}/>}
      {modalIsOpenContries&&<ContriesModal modalIsOpenContries={modalIsOpenContries} setModalIsOpenContries={setModalIsOpenContries} countriesFetching={countriesFetching}/>}
    <NavBar setFilter={setFilter} setSearch={setSearch} filter={filter} setModalIsOpen={setModalIsOpen} setModalIsOpenContries={setModalIsOpenContries} isOpen={isOpen} setIsOpen={setIsOpen}/>
    <div className="w-full flex gap-2 lg:gap-4 pt-5 pb-10 h-full">    
      {/* LIFT */}
      <div className="hidden w-1/4 h-full lg:flex flex-col gap-8 overflow-y-auto">
        {/* Profile  */}
        <div className="w-full shadow-md bg-white rounded-lg px-6 py-5">
          <div className="flex flex-col item-center jstify-between text-xl text-ascente-1 pb-2 ">
            <div className='w-full relative '>
                <img src={CoverImage} className='w-full rounded-md' alt="" />
                <img src={cureentUser?.profile_pic||NoProfile} className='absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rounded-full w-16 h-16' alt="" />
            </div>
            <div className='w-full flex justify-center items-center mt-8 flex-col'>
                <p className='font-semibold font-sans'>{`${cureentUser?.first_name} ${cureentUser?.last_name}`}</p>
                <p className='text-sm'>{cureentUser?.bio}</p>
                <button
                      className="bg-[#0444a4] mt-4 text-white py-1 px-6 rounded-full font-semibold text-sm" onClick={()=>setModalIsOpen(true)}
                    >Edit Profile</button>
            </div>
          </div>
        </div>
        {/*Intrest Contryes */}
        <div className="w-full shadow-md bg-white rounded-lg px-6 py-5 overscroll-auto">
          <div className="flex item-center align-middle justify-between text-xl text-ascente-1 pb-2  border-b border-[#66666645] ">
            <span>Interested Countries</span>
            <IoMdAdd className='text-blue-700' onClick={()=>setModalIsOpenContries(true)} />
          </div>
          <div className="w-full flex flex-wrap gap-1 pt-4 ">
           {countries&&(
            countries?.map((i)=>(
              <img src={i?.img}  key={i._id} alt={i?.code} className="w-12"/>
            ))
           )}
          </div>
        </div>
      </div>
      {/* CENTER */}
      <div className="flex-1 h-full  px-4 flex flex-col gap-6 overflow-y-auto rounded-lg">
        <form
          className="shadow-md bg-white px-4 rounded-lg" onSubmit={handlePostSubmit}
        >
          <div className="w-full flex item-center gap-2 py-4 border-b border-[#66666645]">
            <img
              src={cureentUser?.profile_pic||NoProfile}
              alt="UserImage"
              className="w-14 h-14 rounded-full object-cover"
            />
            <input
              className="w-full rounded-full py-1 bg-secondary bg-opacity-20  border  border-gray-300 outline-none text-sm font-light px-3 placeholder:text-[#666]"
              placeholder="Whats on your mind..."
              name="description"
              ref={descriptionRef}
            />
          </div>
          {descriptionRef!=null && (
  <select name="location" id="location" className='w-full outline-none rounded-full bg-white' onChange={handleSelectChange}>
    {locations?.map((location) => (
      <option key={location._id} value={location.name}>
        {location.name}
      </option>
    ))}
  </select>
)}


          {errMsg?.message && (
            <span
              role="alert"
              className={`text-sm ${
                errMsg?.status === "fail"
                  ? "text-[#f64949fe]"
                  : "text-[#2ba150fe]"
              }mt-0.5`}
            >
              {errMsg?.message}
            </span>
          )}
          <div className="flex items-center justify-between py-4">
            <label
              htmlFor="imageUpload"
              className="flex items-center gap-1 text-base text-ascent-2 text-ascent-1 cursor-pointer"
            >
              <BiImages />
              <span>Image</span>
              <input
                type="file"
                id="imageUpload"
                className="hidden"
                data-max-size="5120"
                accept=".jpg,.png,.jpeg"
                onChange={handleImageUpload}
              />
            </label>

            <label
              htmlFor="videoUpload"
              className="flex items-center gap-1 text-base text-ascent-2 text-ascent-1 cursor-pointer"
            >
              <BiSolidVideo />
              <span>Video</span>
              <input
                type="file"
                id="videoUpload"
                className="hidden"
                data-max-size="5120"
                accept=".mp4,.wav"
              />
            </label>
            <label
              htmlFor="vgifUpload"
              className="flex items-center gap-1 text-base text-ascent-2 text-ascent-1 cursor-pointer"
            >
              <BsFiletypeGif />
              <span>Gif </span>
              <input
                type="file"
                id="vgifUpload"
                className="hidden"
                data-max-size="5120"
                accept=".gif"
              />
            </label>
            <div>
            {posting ? (
                    <Loading />
                  ) : (
                    <button
                      className="bg-[#0444a4] text-white py-1 px-6 rounded-full font-semibold text-sm"
                    >Post</button>
                  )}
                </div>
              </div>
            </form>
            {loading ? (
              <Loading />
            ) : posts?.length > 0 ? (
              <>
              {posts?.map((post) => (
                <PostCard
                  key={post?._id}
                  post={post}
                  user={users}
                  fetchPost={fetchPost}
                />
              ))}
              {!modalIsOpen&&!modalIsOpenContries&&totalPage > 1 && (
          <Stack className="flex justify-center items-center mb-3">
            <Pagination count={totalPage} onChange={handleChange} variant="outlined" color="primary" />
          </Stack>
        )}
              </>
            ) : (
              <div className="flex w-full item-center justify-center">
                <p className="text-lg text-ascent-2">No Post Available</p>
              </div>
            )}
          </div>
      {/* RIGHT */}
      <div className="hidden w-1/3 lg:w-1/4 h-full md:flex flex-col pl-5 bg-white rounded-lg shadow-md gap-3 overflow-y-auto">
      <div className="flex item-center text-xl text-ascente-1 pb-2 mt-2 border-b border-[#66666645] ">
            <span>Users</span>
          </div>
          <div className="w-full flex flex-col gap-5 pt-4">
            {users?.map((i,index)=>(
          <div key={index||i._id}  className="flex item-center justify-between">
                    <div
                      className="w-full flex gap-4 item-center cursor-pointer"
                    >
                      <img
                        src={i?.profile_pic?? NoProfile}
                        alt={i?.first_name}
                        className="w-10 h-10 object-cover rounded-full"
                      />
                      <div className="flex-1">
                        <p className="text-base font-medium text-ascent-1">
                          {`${i?.first_name}  ${i?.last_name}`}
                        </p>
                      </div>
                    </div>
                    <div className="h-6 flex gap-1">
                    </div>
                  </div>
                  ))}
          </div>
      </div>
    </div>
    {loading && (
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-gray-700 bg-opacity-50">
          <Loading />
        </div>)}
  </div>
  )
}

export default Home