
const express = require("express");
const Event = require("../models/Event");

const router = express.Router();


// =====================================================
// GET ALL EVENTS
// GET /api/events
// =====================================================

router.get("/", async (req, res) => {
    try {
        const events = await Event.find()
            .sort({ date: 1 });

        res.status(200).json({
            success: true,
            count: events.length,
            events: events
        });

    } catch (error) {
        console.error("Get events error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load events"
        });
    }
});


// =====================================================
// GET SINGLE EVENT
// GET /api/events/:id
// =====================================================

router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            event: event
        });

    } catch (error) {
        console.error("Get single event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to load event"
        });
    }
});


// =====================================================
// CREATE EVENT
// POST /api/events
// =====================================================

router.post("/", async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            time,
            location,
            price,
            totalSeats,
            image,
            organizer
        } = req.body;


        // Check required fields
        if (
            !title ||
            !description ||
            !category ||
            !date ||
            !time ||
            !location ||
            price === undefined ||
            !totalSeats
        ) {
            return res.status(400).json({
                success: false,
                message: "All required fields must be provided"
            });
        }


        // Validate price
        if (Number(price) < 0) {
            return res.status(400).json({
                success: false,
                message: "Price cannot be negative"
            });
        }


        // Validate seats
        if (Number(totalSeats) <= 0) {
            return res.status(400).json({
                success: false,
                message: "Total seats must be greater than 0"
            });
        }


        // Create event
        const event = await Event.create({
            title: title.trim(),
            description: description.trim(),
            category: category.trim(),
            date: date,
            time: time,
            location: location.trim(),
            price: Number(price),
            totalSeats: Number(totalSeats),
            availableSeats: Number(totalSeats),
            image: image || "",
            organizer: organizer || null
        });


        res.status(201).json({
            success: true,
            message: "Event created successfully!",
            event: event
        });

    } catch (error) {
        console.error("Create event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create event"
        });
    }
});


// =====================================================
// UPDATE EVENT
// PUT /api/events/:id
// =====================================================

router.put("/:id", async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            date,
            time,
            location,
            price,
            totalSeats,
            image
        } = req.body;


        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }


        // Update only provided fields
        if (title !== undefined) {
            event.title = title.trim();
        }

        if (description !== undefined) {
            event.description = description.trim();
        }

        if (category !== undefined) {
            event.category = category.trim();
        }

        if (date !== undefined) {
            event.date = date;
        }

        if (time !== undefined) {
            event.time = time;
        }

        if (location !== undefined) {
            event.location = location.trim();
        }

        if (price !== undefined) {
            if (Number(price) < 0) {
                return res.status(400).json({
                    success: false,
                    message: "Price cannot be negative"
                });
            }

            event.price = Number(price);
        }

        if (totalSeats !== undefined) {
            const newTotalSeats = Number(totalSeats);

            if (newTotalSeats <= 0) {
                return res.status(400).json({
                    success: false,
                    message: "Total seats must be greater than 0"
                });
            }

            const bookedSeats =
                event.totalSeats - event.availableSeats;

            if (newTotalSeats < bookedSeats) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Total seats cannot be less than already booked seats"
                });
            }

            event.totalSeats = newTotalSeats;
            event.availableSeats =
                newTotalSeats - bookedSeats;
        }

        if (image !== undefined) {
            event.image = image;
        }


        await event.save();


        res.status(200).json({
            success: true,
            message: "Event updated successfully!",
            event: event
        });

    } catch (error) {
        console.error("Update event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update event"
        });
    }
});


// =====================================================
// DELETE EVENT
// DELETE /api/events/:id
// =====================================================

router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.status(200).json({
            success: true,
            message: "Event deleted successfully!"
        });

    } catch (error) {
        console.error("Delete event error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete event"
        });
    }
});


// =====================================================
// EXPORT ROUTER
// =====================================================

module.exports = router;
