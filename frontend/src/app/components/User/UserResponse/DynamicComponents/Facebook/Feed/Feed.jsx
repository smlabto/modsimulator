import { useEffect, useRef, useCallback, useState } from "react";
import PostTop from './Post/PostTop';
import { useSelector, useDispatch } from "react-redux";
import { selectAllPostIds } from '../../../../../../selectors/socialMedia';
import PostBottom from "./Post/PostBottom";
import useStyles from '../../../../../style';
import {
  getFacebookWithCommentsPosts
} from '../../../../../../actions/socialMedia';
import { updateUserMain } from '../../../../../../actions/user';
import Progress from '../../../../../Common/Progress';
import "./Feed.css";

const Feed = ({ omitInteractionBar }) => {
  const allIds = useSelector(state => selectAllPostIds(state));
  const currentPostPage = useSelector(state => state.socialMedia.currentPostPage);
  const isLoading = useSelector(state => state.socialMedia.isLoading);
  const postEachPage = useSelector(state => state.socialMedia.postEachPage);
  const totalPostIds = useSelector(state => state.socialMedia.totalPostIds);
  const finish = useSelector(state => state.socialMedia.finish);

  const classes = useStyles();
  const dispatch = useDispatch();
  const observer = useRef();

  const fetchInfoDetails = async () => {
    try {
      // dispatch finish response event - to indicate that the user reached the end of the feed
      const utcDateTime = new Date();
      var utcDateTimeString = utcDateTime.toISOString().replace('Z', '').replace('T', ' ');
      await dispatch(updateUserMain({ finishedAt: utcDateTimeString }));
    } catch (error) {
      //setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!finish) {
      const startIndex = currentPostPage * postEachPage;
      const slicePosts = totalPostIds.slice(startIndex, startIndex+5);
      dispatch(getFacebookWithCommentsPosts({ postIds: slicePosts }));
    }else {
      fetchInfoDetails();
    }
  }, []);

  const lastPostRef = useCallback(node => {
    if (isLoading) return;
    if (observer.current) observer.current.disconnect()
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && !finish) {
        const startIndex = currentPostPage * postEachPage;
        const slicePosts = totalPostIds.slice(startIndex, startIndex+5);
        dispatch(getFacebookWithCommentsPosts({ postIds: slicePosts }))
      }
    })
    if (node) observer.current.observe(node)
  }, [isLoading, finish, currentPostPage, postEachPage, totalPostIds, dispatch])

  return (
    <>
      <div className={classes.feed}>
        {allIds.map((postId, index) => {
          if (allIds.length === index + 1) {
            return (<div key={postId} ref={lastPostRef} className={classes.post}>
              <PostTop id={postId} />
              <PostBottom id={postId} omitInteractionBar={omitInteractionBar}/>
            </div>)
          } else {
            return (<div key={postId} className={classes.post}>
              <PostTop id={postId} />
              <PostBottom id={postId} omitInteractionBar={omitInteractionBar}/>
            </div>)
          }
        })}
        {finish && <div className={classes.post} style={{ backgroundColor: '#d9d9d9', padding: '10px' }}><center><b>End of the feed. Scroll up to engage with previous posts before time expires.</b></center></div>}
      </div>
      <div className="paddingTop">
        {isLoading && <Progress />}
      </div>
    </>
  );
};

export default Feed;