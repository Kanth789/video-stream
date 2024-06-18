'use client'
import { useGetCalls } from "@/hooks/useGetCall";
import { Call, CallRecording } from "@stream-io/video-react-sdk";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import MeetingCard from "../MeetingCard";
import Loader from "../Loader";

const CallList = ({ type }: { type: "ended" | "upcoming" | "recordings" }) => {
  const { endedCalls, upcomingCalls, callRecordings, isLoading } =
    useGetCalls();
  const router = useRouter();
  const [recordings, setRecordings] = useState<CallRecording[]>([]);

  useEffect(() => {
    const fetchRecordings = async () => {
      const callData = await Promise.all(
        callRecordings?.map((meeting) => meeting.queryRecordings()) ?? [],
      );

      const recordings = callData
        .filter((call) => call.recordings.length > 0)
        .flatMap((call) => call.recordings);

        setRecordings(recordings);
    };

    if (type === 'recordings') {
      fetchRecordings();
    }
  }, [type, callRecordings]);

  if (isLoading) return <Loader />;

  const getCalls = () => {
    switch (type) {
      case "ended":
        return endedCalls;
      case "recordings":
        return callRecordings;
      case "upcoming":
        return upcomingCalls;
      default:
        return [];
    }
  };

  const getNoCallsMessage = () => {
    switch (type) {
      case "ended":
        return "No Previous Calls";
      case "recordings":
        return "No Recordings";
      case "upcoming":
        return "No Upcoming Calls";
      default:
        return [];
    }
  };

  const calls  = getCalls()
  const noCallMessgae  = getNoCallsMessage()

  return <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
    {calls && calls.length > 0 ? calls.map((each:Call | CallRecording,index)=>(
      <MeetingCard key={(each as Call).id}
      icon={
        type === 'ended'
          ? '/icons/previous.svg'
          : type === 'upcoming'
            ? '/icons/upcoming.svg'
            : '/icons/recordings.svg'
      }
      title={
        (each as Call).state?.custom?.description ||
        (each as CallRecording).filename?.substring(0, 20) ||
        'No Description'
      }
      date={
        (each as Call).state?.startsAt?.toLocaleString() ||
        (each as CallRecording).start_time?.toLocaleString()
      }
      isPreviousMeeting={type === 'ended'}
      link={
        type === 'recordings'
          ? (each as CallRecording).url
          : `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${(each as Call).id}`
      }
      buttonIcon1={type === 'recordings' ? '/icons/play.svg' : undefined}
      buttonText={type === 'recordings' ? 'Play' : 'Start'}
      handleClick={
        type === 'recordings'
          ? () => router.push(`${(each as CallRecording).url}`)
          : () => router.push(`/meeting/${(each as Call).id}`)
      }/>
    )):(
      <h1>{noCallMessgae}</h1>
    )}
    </div>;
};

export default CallList;
