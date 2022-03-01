import classnames from './classnames';
import {splitPath} from './paths';

const slideInDelayMillis = 300;

const hideAll = () => {

    document.getElementById(classnames.modalLayerId).classList.add(classnames.hidden);

    const roomModalsContainers = document.getElementsByClassName(classnames.roomModalsContainer);
    const roomInfoModalRoots = document.getElementsByClassName(classnames.roomInfoModalRoot);
    const deviceModalRoots = document.getElementsByClassName(classnames.deviceModalRoot);
    const deviceContainers = document.getElementsByClassName(classnames.deviceContainer);

    // Hide all the things
    [roomModalsContainers, roomInfoModalRoots, deviceModalRoots, deviceContainers].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            element.classList.add(classnames.hidden);
        });
    });

    // Remove any "slide-in" classes from room-info-modal or device-modal roots
    [roomInfoModalRoots, deviceModalRoots].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            element.classList.remove(classnames.slideIn);
        });
    });
};

const showModalContainerForRoom = (workspaceId, roomId) => {
    // Show modals layer
    document.getElementById(classnames.modalLayerId).classList.remove(classnames.hidden);

    // Show modals-container for room
    const modalsContainer = document.getElementById(`${workspaceId}-${roomId}-modals`);
    modalsContainer.classList.remove(classnames.hidden);

    return modalsContainer;
};

const showDevice = path => {
    hideAll();

    const [workspaceId, roomId, , deviceId] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show device-modal root in container.  Always one per room.
    const deviceModalRoot = modalsContainer.getElementsByClassName(classnames.deviceModalRoot)[0];
    deviceModalRoot.classList.remove(classnames.hidden);

    // Show the single device container. Always only one match per device-modal root.
    const deviceContainer = deviceModalRoot.getElementsByClassName(`${classnames.deviceContainer} ${classnames.deviceIdPrefix}${deviceId}`)[0]
    console.log(deviceContainer);
    deviceContainer.classList.remove(classnames.hidden);

    // Finally, slide in the device-modal root
    setTimeout(() => {
        deviceModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

const showRoomInfo = path => {
    hideAll();

    const [workspaceId, roomId,] = splitPath(path);

    const modalsContainer = showModalContainerForRoom(workspaceId, roomId);

    // Show room-info-modal root in container.  Always one per room.
    const roomInfoModalRoot = modalsContainer.getElementsByClassName(classnames.roomInfoModalRoot)[0];
    roomInfoModalRoot.classList.remove(classnames.hidden);

    // And slide it in
    setTimeout(() => {
        roomInfoModalRoot.classList.add(classnames.slideIn);
    }, slideInDelayMillis);
};

export default {
    hideAll: hideAll,
    showDevice: showDevice,
    showRoomInfo: showRoomInfo
}
