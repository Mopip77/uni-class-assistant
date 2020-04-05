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
	JOIN_COURSE: API_SERVER + 'course/join',
	DELETE_COURSE: API_SERVER + 'course/delete',
	EXIT_COURSE: API_SERVER + 'course/exit',
	
	// bulltin
	CREATE_BULLETIN: API_SERVER + 'bulletin/create',
	GET_BULLETIN: API_SERVER + 'bulletin',
	
	
	TEST_URL: API_SERVER + 'test'
}