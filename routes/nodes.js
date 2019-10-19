const knex = require('../client');
const express = require('express');
const router = express.Router();
// const axios = require('axios');
const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json())


// Helper files
const Controller = require("./controllerHelpers")

// Query files
const SensorsQuery = require("../db/queries/sensorsQuery")
const ControllersQuery = require("../db/queries/controllersQuery")
const NodeQuery = require("../db/queries/nodeQuery")
const DeviceQuery = require('../db/queries/deviceQuery.js')








// Save Readings to DB

router.post('/sensors/readings', (req, res) => {
    const postParams = {
        node: req.body.node,
        device: req.body.device,
        sensor: req.body.sensor,
        date: req.body.date,
        value: req.body.value
    };
    SensorsQuery.saveSensorReading(postParams)
    res.send(`sensors: ${postParams.sensor}`)

});


// query Info

// nodes
router.get('/nodes', async (req, res) => {
    const nodesData = await NodeQuery.getAll();
    res.send(nodesData);
});

// device

//  get all device
router.get('/devices', async (req, res) => {
    const deviceData = await DeviceQuery.getAllDevices()
    res.send(deviceData);
});

//  get one device info
router.get(`/device/:id`, async (req, res) => {
    const device_id = req.params.id;
    const deviceData = await DeviceQuery.getOneDevice(device_id);
    res.send(deviceData)
});

// get sensors on one device
router.get(`/devices/:id/sensors`, async (req, res) => {
    const device_id = req.params.id;
    const sensorsData = await SensorsQuery.getSensorsByDevice(device_id);
    res.send(sensorsData)
});

// get Controller on one device
router.get(`/devices/:id/controllers`, async (req, res) => {
    const device_id = req.params.id;
    const controllersData = await ControllersQuery.getControllerByDevice(device_id);
    res.send(controllersData)
});


//  Sensors

// get all readings of one sensor
router.get('/sensor/:id/readings', async (req, res) => {
    const sensor_id = req.params.id;
    const readings = await SensorsQuery.allReadings(sensor_id);
    res.send(readings)

});

// all sensor readings on one devise
router.get('/device/:id/sensors/readings', async (req, res) => {
    const device_id = req.params.id;
    const sensorsData = await SensorsQuery.getSensorsByDevice(device_id);
    const allReadings = await SensorsQuery.getSensorsReading(sensorsData)
    res.send(allReadings)
});


//  get last reading of a sensor in db

router.get('/sensor/:id/reading', async (req, res) => {
    const sensor_id = req.params.id;
    const reading = await SensorsQuery.lastReading(sensor_id);
    res.send(reading)
});


// Controller 

// Toggle on/off 

router.get('/controller/:id/boolean', async (req, res) => {
    const controller_id = req.params.id;
    const controllerData = await ControllersQuery.getControllerFromId(controller_id)
    const deviceIp = await DeviceQuery.getDeviceIp(controllerData.device_id);
     await Controller.toggleState(deviceIp, controllerData.name)
    res.send( "finished")
})

router.get('/devices/:id/controllers/state', async (req, res ) =>{
    const device_id = req.params.id;
    const deviceIp = await DeviceQuery.getDeviceIp(device_id);
    const allControllers = await ControllersQuery.getControllerByDevice(device_id);
    const controllersState = await Controller.getControllersStates(deviceIp, allControllers);
    res.send(controllersState);
})


// Information routes

// Current Tempature

router.get('/sensor/:id/current', async (req, res) => {

    const sensor_id = req.params.id;
    const sensorData = await SensorsQuery.getSensorFromId(sensor_id);
    const deviceData = await DeviceQuery.getOneDevice(sensorData.device_id)
    const reading = await SensorsQuery.currentReading(sensorData.name, deviceData[0])
    res.send(reading);

})


module.exports = router;