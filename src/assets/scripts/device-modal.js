import classnames from './classnames';
import {splitPath} from './paths';

const modalLayerId = 'ws-modal-layer';

const hideAll = () => {

    document.getElementById(modalLayerId).classList.add(classnames.hidden);

    const roomModalsContainers = document.getElementsByClassName(classnames.roomModalsContainer);
    const deviceModalRoots = document.getElementsByClassName(classnames.deviceModalRoot);
    const deviceContainers = document.getElementsByClassName(classnames.deviceContainer);

    [roomModalsContainers, deviceModalRoots, deviceContainers].forEach(elementCollection => {
        Array.from(elementCollection).forEach(element => {
            element.classList.add(classnames.hidden);
        });
    });
};

const showDevice = path => {
    hideAll();

    const [workspaceId, roomId, , deviceId] = splitPath(path);
    console.log(workspaceId, roomId, deviceId);

    // Show modals layer
    document.getElementById(modalLayerId).classList.remove(classnames.hidden);

    // Show modals-container for room
    const modalsContainer = document.getElementById(`${workspaceId}-${roomId}-modals`);
    modalsContainer.classList.remove(classnames.hidden);

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
    }, 300);
};

export default {
    hideAll: hideAll,
    showDevice: showDevice
}
