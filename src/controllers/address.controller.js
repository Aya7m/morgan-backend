import { Address } from "../models/address.model.js";

export const addNewAddress = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { country, city, postalCode, buildingNumber, floorNumber, setIsDefault } = req.body;

        if (!country || !city || !postalCode || !buildingNumber || !floorNumber) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newAddress = {
            userId,
            country,
            city,
            postalCode,
            buildingNumber,
            floorNumber,
            isDefault: ['true', 'false'].includes(setIsDefault) ? setIsDefault : false,
        };

        if (newAddress.isDefault) {
            // Set all other addresses for this user to not default
            await Address.updateMany({ userId, isDefault: true }, { isDefault: false });
        }

        // Assuming Address is a Mongoose model
        const createdAddress = await Address.create(newAddress);
        res.status(201).json({ message: "Address added successfully", data: createdAddress });

    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// edit address
export const editAddress = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { country, city, postalCode, buildingNumber, floorNumber, setIsDefault } = req.body;
        const { addressId: id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const address = await Address.findOne({ _id: id, userId });
        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        if (country) address.country = country;
        if (city) address.city = city;
        if (postalCode) address.postalCode = postalCode;
        if (buildingNumber) address.buildingNumber = buildingNumber;
        if (floorNumber) address.floorNumber = floorNumber;

        if (setIsDefault === true || setIsDefault === "true") {
            address.isDefault = true;
            // Set all other addresses to not default
            await Address.updateMany({ userId, _id: { $ne: id } }, { isDefault: false });
        }

        const updatedAddress = await address.save();
        res.status(200).json({ message: "Address updated successfully", data: updatedAddress });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// delete address
export const deleteAddress = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const { addressId: id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Address ID is required" });
        }

        const address = await Address.findOneAndUpdate(
            {
                _id: id,
                userId,
                isMarkedDeleted: false
            },
            {
                $set: {
                    isMarkedDeleted: true,
                    isDefault: false
                }
            },
            {
                new: true
            }

        )

        if (!address) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({ message: "Address deleted successfully", data: address });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}

// get all addresses
export const getAllAddresses = async (req, res) => {
    try {
        const userId = req.authuser._id;
        const addresses = await Address.find({ userId, isMarkedDeleted: false });
        res.status(200).json({ message: "Addresses fetched successfully", data: addresses });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
}