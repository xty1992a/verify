import request from './request'

export const getSmsCode = () => request('/Business/GetSmsCode?mobile=18602098232&bid=a08ebbfa-0ad0-e311-a603-90b11c47e695', null, 'post')
export const getCheckCode = () => request('/Business/getCheckCode?mobile=18602098232&bid=a08ebbfa-0ad0-e311-a603-90b11c47e695', null, 'post')
