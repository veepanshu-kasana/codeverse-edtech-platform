import React, { useEffect, useRef, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { updatedCompletedLectures } from '../../../slices/viewCourseSlice';
import ReactPlayer from 'react-player';
import { IconBtn } from '../../common/IconBtn';
import { markLectureAsComplete } from '../../../services/operations/courseDetailsAPI';

export const VideoDetails = () => {

  const { courseId, sectionId, subSectionId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const playerRef = useRef(null);
  const { token } = useSelector((state) => state.auth);
  const {courseSectionData, courseEntireData, completedLectures} = useSelector((state) => state.viewCourse);

  const [videoData, setVideoData] = useState([]);
  const [previewSource, setPreviewSource] = useState("");
  const [videoEnded, setVideoEnded] = useState(false);
  const [loading, setLoading] = useState(false);

  // useEffect(() => {
  //   console.log("Current video data:", {
  //     courseId,
  //     sectionId,
  //     subSectionId,
  //     videoData
  //   });
  // }, [courseId, sectionId, subSectionId]);

  useEffect(() => {
    const setVideoSpecificDetails = async() => {
      if(!courseSectionData.length)
        return;

      if(!courseId && !sectionId && !subSectionId) {
        navigate("/dashboard/enrolled-courses");
      }
      else {
        // Let's assume all 3 fields are present
        const filteredData = courseSectionData.filter(
          (course) => course._id === sectionId
        )

        const filteredVideoData = filteredData?.[0]?.subSection.filter(
          (data) => data._id === subSectionId
        )

        setVideoData(filteredVideoData[0]);
        setPreviewSource(courseEntireData.thumbnail);
        setVideoEnded(false);
      }
    }
    setVideoSpecificDetails();
  },[courseSectionData, courseEntireData, location.pathname])

  const isFirstVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )
    if(currentSectionIndex === 0 && currentSubSectionIndex === 0) {
      return true;
    }
    else {
      return false;
    }
  }

  const isLastVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )
    if(currentSectionIndex === courseSectionData.length - 1 && 
      currentSubSectionIndex === noOfSubSections -1) {
        return true;
      }
    else {
      return false;
    }
  }
  
  const goToNextVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const noOfSubSections = courseSectionData[currentSectionIndex].subSection.length;
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if(currentSubSectionIndex !== noOfSubSections - 1) {
      //Same section, Next video
      const nextSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSubSectionIndex + 1]._id;
      //Navigate to next video
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${nextSubSectionId}`);
    }
    else {
      //Next section, First Video 
      const nextSectionId = courseSectionData[currentSectionIndex + 1]._id;
      const nextSubSectionId = courseSectionData[currentSectionIndex + 1].subSection[0]._id;
      //View same video
      navigate(`/view-course/${courseId}/section/${nextSectionId}/sub-section/${nextSubSectionId}`);
    }
  }

  const goToPrevVideo = () => {
    const currentSectionIndex = courseSectionData.findIndex(
      (data) => data._id === sectionId
    )
    const currentSubSectionIndex = courseSectionData[currentSectionIndex].subSection.findIndex(
      (data) => data._id === subSectionId
    )

    if(currentSubSectionIndex !== 0) {
      //Same section, Previous video
      const prevSubSectionId = courseSectionData[currentSectionIndex].subSection[currentSectionIndex - 1]._id;
      //Navigate to prev video
      navigate(`/view-course/${courseId}/section/${sectionId}/sub-section/${prevSubSectionId}`);
    }
    else {
      //Previous section, Last video 
      const prevSectionId = courseSectionData[currentSectionIndex - 1]._id;
      const prevSubSectionLength = courseSectionData[currentSectionIndex - 1].subSection.length;
      const prevSubSectionId = courseSectionData[currentSectionIndex - 1].subSection[prevSubSectionLength - 1]._id;
      //View same video
      navigate(`/view-course/${courseId}/section/${prevSectionId}/sub-section/${prevSubSectionId}`);
    }
  }

  const handleLectureCompletion = async() => {
    setLoading(true);
    if (!courseId || !subSectionId) {
        throw new Error("Missing course or lecture ID");
    }
    // console.log({ courseId, subSectionId });
    const response = await markLectureAsComplete({courseId: courseId, subSectionId:subSectionId}, token);
    if(response) {
      dispatch(updatedCompletedLectures(subSectionId));
    }
    setLoading(false);
  }

  return (
    <div className='flex flex-col gap-5 text-white pt-1'>
      {
        !videoData ? (
          <img
            src={previewSource}
            alt='Preview'
            className='h-full w-full rounded-md object-cover'
          />
        ) : ( 
          <>
            <ReactPlayer
              ref={playerRef}
              url={videoData?.videoUrl}
              controls={true}
              width="100%"
              height="100%"
              style={{ backgroundColor: 'black' }}
              volume={0.8} // Set default volume (0.8 = 80%)
              onError={(e) => console.error('Player error:', e)}
              onEnded={() => setVideoEnded(true)}
              config={{
                file: {
                  attributes: {
                    controlsList: 'nodownload',
                    disablePictureInPicture: true,
                    playsInline: true,
                  },
                }
              }}
            />
            
            {/* <BigPlayButton position="center"/> */}
            {
              videoEnded && (
                <div
                style={{
                  backgroundImage:
                    "linear-gradient(to top, rgb(0, 0, 0), rgba(0,0,0,0.7), rgba(0,0,0,0.5), rgba(0,0,0,0.1)",
                }}
                className='full absolute inset-0 z-[100] grid h-full place-content-center font-inter'
              >
                  {
                    !completedLectures.includes(subSectionId) && (
                      <IconBtn
                        disabled={loading}
                        onclick={() => handleLectureCompletion()}
                        text={!loading ? "Mark As Completed" : "Loading..."}
                        customClasses='text-xl max-w-max px-4 mx-auto'
                      />
                    )
                  }

                  <IconBtn
                    disabled={loading}
                    onclick={() => {
                      try {
                        // Use ReactPlayer's built-in methods
                        if (playerRef.current) {
                          playerRef.current.seekTo(0);
                          // For auto-play, we need to handle browser restrictions
                          setTimeout(() => {
                            const internalPlayer = playerRef.current?.getInternalPlayer?.();
                            if (internalPlayer?.play) {
                              internalPlayer.play().catch(e => {
                                console.log("Auto-play prevented, user interaction required:", e);
                                // Fallback to showing play button
                                setVideoEnded(false);
                              });
                            }
                          }, 100);
                        }
                        setVideoEnded(false);
                      } catch (error) {
                        console.error("Error handling rewatch:", error);
                      }
                    }}
                    text="Rewatch"
                    customClasses="text-xl max-w-max px-4 mx-auto mt-2"
                  />

                  <div className='mt-10 flex min-w-[250px] justify-center gap-x-4 text-xl'>
                    {
                      !isFirstVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToPrevVideo}
                          className='blackButton'
                        >
                          Prev
                        </button>
                      )
                    }
                    {
                      !isLastVideo() && (
                        <button
                          disabled={loading}
                          onClick={goToNextVideo}
                          className='blackButton'
                        >
                          Next
                        </button>
                      )
                    }
                  </div>
                </div>
              )
            }
          </>
        )
      }
      <h1 className='mt-4 text-3xl font-semibold'>
        {videoData?.title}
      </h1>
      <p className='pt-2 pb-6'>
        {videoData?.description}
      </p>
    </div>
  )
}