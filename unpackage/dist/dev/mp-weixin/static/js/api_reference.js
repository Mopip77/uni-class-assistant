const API_SERVER = 'http://47.107.90.226:9106/wxma/'

export default {
	SERVER_URL: API_SERVER,
	// user
	CHECK_TOKEN_URL: API_SERVER + 'user/check-token',
	LOGIN_URL: 'http://47.107.90.226:9105/wxma/auth/login',
	UPLOAD_USER_INFO: API_SERVER + 'user/upload-info',
	GET_USERINFO_URL: API_SERVER + 'user/info',
	UPDATE_USERINFO_URL: API_SERVER + 'user/update-info',
	
	
	// course
	GET_TEACHED_COURSE: API_SERVER + 'course/teach',
	GET_JOINED_COURSE: API_SERVER + 'course/study',
	GET_COURSE: API_SERVER + 'course',
	CREATE_COURSE: API_SERVER + 'course/create',
	UPDATE_COURSE: API_SERVER + 'course/update',
	JOIN_COURSE: API_SERVER + 'course/join',
	DELETE_COURSE: API_SERVER + 'course/delete',
	EXIT_COURSE: API_SERVER + 'course/exit',
	GET_MEMBERS: API_SERVER + 'course/members',
	KICK_OUT_MEMBER: API_SERVER + 'course/kick',
	ASSIGN_TEACHER: API_SERVER + 'course/assign-teacher',
	SCOER_RULE: API_SERVER + 'course/score-rule',
	SCOER_CAL: API_SERVER + 'course/score-cal',
	GET_STUDENT_SCORE: API_SERVER + 'course/student-score',
	
	// bulltin
	CREATE_BULLETIN: API_SERVER + 'bulletin/create',
	GET_BULLETIN: API_SERVER + 'bulletin',
	
	// topic
	TOPIC: API_SERVER + 'topic',
	GET_TOPIC: API_SERVER + 'topic',
	GET_TOPICS_BY_COURSE: API_SERVER + 'topic/course',
	
	// comment
	COMMENT: API_SERVER + 'comment',
	GET_COMMENT_LIST: API_SERVER + 'comment/list',
	
	// like
	LIKE: API_SERVER + 'like',
	
	// chat
	CHAT: API_SERVER + 'chat',
	LATEST_CHAT_PAIR: API_SERVER + 'chat/latest',
	
	// contest
	CONTEST: API_SERVER + 'contest',
	GET_CONTESTS_BY_COURSEID: API_SERVER + 'contest/course',
	GET_CONTEST_DETAIL: API_SERVER + 'contest/detail',
	ANSWER: API_SERVER + 'contest/answer',
	ANSWER_LIST: API_SERVER + 'contest/answer/list',
	REVISE_ANSWER: API_SERVER + 'contest/revise',
	GET_CONTEST_AS_CREATOR: API_SERVER + 'contest/creator',
	GET_CONTEST_AS_PARTICIPATOR: API_SERVER + 'contest/participator',
	PUBLISH_CONTEST: API_SERVER + 'contest/publish',
	
	// course_ware
	COURSE_WARE: API_SERVER + 'course-ware',
	USER_COURSE_WARE: API_SERVER + 'course-ware/user',
	GET_COURSE_WARE_BY_COURSEID: API_SERVER + 'course-ware/course',
	READ_COURSE_WARE: API_SERVER + 'course-ware/read',
	COURSE_WARE_COMMENT: API_SERVER + 'course-ware/comment',
	GET_COURSE_WARE_AS_CREATOR: API_SERVER + 'course-ware/creator',
	GET_COURSE_WARE_AS_READER: API_SERVER + 'course-ware/reader',
	PUBLISH_COURSE_WARE: API_SERVER + 'course-ware/publish',
	
	// notification
	NOTIFICATION: API_SERVER + 'notification',
	NOTIFICATION_LIST: API_SERVER + 'notification/list',
	NOTIFICATION_CALLBACK_URL: API_SERVER + 'notification/callbackUrl',
	
	// upload
	UPLOAD_AVATAR: API_SERVER + 'upload/avatar',
	UPLOAD_QUESTION: API_SERVER + 'upload/question',
	UPLOAD_COURSE_WARE: API_SERVER + 'upload/course-ware',
	
	// favorite
	FAVORITE: API_SERVER + 'favorite',
	FAVORITE_LIST: API_SERVER + 'favorite/list',
	FAVORITE_EXIST: API_SERVER + 'favorite/exist',
	FAVORITE_BY_TYPE: API_SERVER + 'favorite/type',
	
	// class
	CLASS: API_SERVER + 'class',
	GET_CLASS_BY_COURSE_ID: API_SERVER + 'class/course',
	GET_CLASS_INFO_AS_TEACHER: API_SERVER + 'class/teacher',
	GET_CLASS_INFO_AS_STUDENT: API_SERVER + 'class/student',
	PUBLISH_CLASS: API_SERVER + 'class/publish',
	FINISH_CLASS: API_SERVER + 'class/finish',
	START_SIGN_IN: API_SERVER + 'class/start-sign-in',
	SIGN_IN_COUNT: API_SERVER + 'class/sign-in-count',
	SIGN_IN: API_SERVER + 'class/sign-in',
	CLASS_NOTE: API_SERVER + 'class/note',
	
	
	
	TEST_URL: API_SERVER + 'test'
}