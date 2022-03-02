import Router from './router';
import {canonicalPath, hardwarePathPart, homePath, isDevicePath, makePath, splitPath} from './paths';
import {updateUi, toSelectedWorkSpace, backToHome} from './spaces';
import deviceModal from './device-modal';
import commonData from '../../../../../../../data/common.json';
import workspaces from '../../../../../../../data/workspaces.json';
import devicesByRoom from '../../../../../../../data/devicesByRoom.json';

const router = new Router();

window.addEventListener('hashchange', (ev) => {
    router.route(canonicalPath(window.location));
});

window.addEventListener('resize', () => {
    updateUi(window.location);
});

window.addEventListener('load', function () {
    router.route(canonicalPath(window.location));
});

// Routing for the initial view
router.add(homePath, () => {
    backToHome();
    updateUi(window.location);
})

// Handle workspace and workspace/room routing
commonData.orderedWorkspaceIds.forEach((workspaceId) => {
    router.add(makePath([workspaceId]), () => {
        deviceModal.hideAll();
        toSelectedWorkSpace(workspaceId);
        updateUi(window.location);
    })

    workspaces[workspaceId].rooms.forEach((room) => {
        router.add(makePath([workspaceId, room.slug]), () => {
            deviceModal.hideAll();
            toSelectedWorkSpace(workspaceId, room.slug);
            updateUi(window.location);
        });

        const devicesForRoom = devicesByRoom[workspaceId][room.slug]
        devicesForRoom.forEach(deviceId => {
            const devicePath = makePath([workspaceId, room.slug, hardwarePathPart, deviceId]);
            router.add(devicePath, () => {
                toSelectedWorkSpace(workspaceId, room.slug);
                updateUi(window.location);
                if (isDevicePath(devicePath)) {
                    deviceModal.showDevice(devicePath);
                }
            })
        })
    })
});