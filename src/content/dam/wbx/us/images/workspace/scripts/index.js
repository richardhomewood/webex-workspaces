import Router from './router';
import {updateUi, toSelectedWorkSpace, backToHome} from './spaces';
import {canonicalPath, hardwarePathPart, homePath, infoPathPart, makePath} from './paths';
import modals from './modals'
import commonData from '../../../../../../../data/common.json';
import workspaces from '../../../../../../../data/workspaces.json';
import devicesByRoom from '../../../../../../../data/devicesByRoom.json';

const router = new Router();

window.addEventListener('hashchange', () => {
    router.route(canonicalPath(window.location));
});

window.addEventListener('resize', () => {
    updateUi(window.location);
});

window.addEventListener('load', function () {
    router.route(canonicalPath(window.location));
});

window.addEventListener('click', event => {
    modals.closeIfClickedOutsideOpenModal(event);
});

modals.enableCloseButtons();

// Routing for the initial view
router.add(homePath, () => {
    backToHome();
    updateUi(window.location);
})

// Handle workspace and workspace/room routing
commonData.orderedWorkspaceIds.forEach((workspaceId) => {
    router.add(makePath([workspaceId]), () => {
        modals.hideAll();
        toSelectedWorkSpace(workspaceId);
        updateUi(window.location);
    })

    const {rooms} = workspaces[workspaceId];
    rooms.forEach((room) => {
        router.add(makePath([workspaceId, room.slug]), () => {
            modals.hideAll();
            toSelectedWorkSpace(workspaceId, room.slug);
            updateUi(window.location);
        });

        const roomInfoPath = makePath([workspaceId, room.slug, infoPathPart]);
        router.add(roomInfoPath, () => {
            modals.hideAll();
            toSelectedWorkSpace(workspaceId, room.slug);
            updateUi(window.location);
            modals.showRoomInfo(roomInfoPath);
        });

        const devicesForRoom = devicesByRoom[workspaceId][room.slug]
        devicesForRoom.forEach(deviceId => {
            const devicePath = makePath([workspaceId, room.slug, hardwarePathPart, deviceId]);
            router.add(devicePath, () => {
                toSelectedWorkSpace(workspaceId, room.slug);
                updateUi(window.location);
                modals.showDevice(devicePath);
            })
        })
    });
});
