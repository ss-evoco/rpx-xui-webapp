import * as express from 'express';
import authInterceptor from '../lib/middleware/auth';
import { addNewUser, updateUserStatus, getStaffRefUserDetails } from './index';
import { getFilteredUsers, getJobTitles, getServices, getSkills, getUsersByPartialName, getUserTypes } from './real-api';

const router = express.Router({ mergeParams: true });

router.use(authInterceptor);
router.get('/getFilteredUsers', getFilteredUsers);
router.get('/getUsersByPartialName', getUsersByPartialName);
router.get('/getStaffRefUserDetails/:id', getStaffRefUserDetails);
router.get('/getUserTypes', getUserTypes);
router.get('/getJobTitles', getJobTitles);
router.get('/getSkills', getSkills);
router.get('/getServices', getServices);
router.post('/addNewUser', addNewUser);
router.put('/updateUserStatus', updateUserStatus);
export default router;