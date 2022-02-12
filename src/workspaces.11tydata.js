const util = require('util');

module.exports = {
  eleventyComputed: {
    // This function makes a copy of each room's device ID list, split by vendor.
    vendorDevicesByRoom: data => {
      const val = {}
      for (const workspace of Object.keys(data.devicesByRoom)) {
        val[workspace] = {};
        for (const room of Object.keys(data.devicesByRoom[workspace])) {
          // This will contain a map of vendors to device IDs
          val[workspace][room] = {};
          for (const deviceId of data.devicesByRoom[workspace][room]) {
            const device = data.devices[deviceId];
            if (!val[workspace][room].hasOwnProperty(device.vendor)) {
              val[workspace][room][device.vendor] = [];
            }
            val[workspace][room][device.vendor].push(deviceId);
          }
        }
      }
      console.log("VAL:" + util.inspect(val, false, 10));
      return val;
    }
  }
}
