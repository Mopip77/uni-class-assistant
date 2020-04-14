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
	
	// upload
	UPLOAD_AVATAR: API_SERVER + 'upload/avatar',
	UPLOAD_QUESTION: API_SERVER + 'upload/question',
	
	TEST_URL: API_SERVER + 'test'
}