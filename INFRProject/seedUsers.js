const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/users');

const seedUsers = async () => {
    try {
        await mongoose.connect('mongodb+srv://danielookoro:Rukewwe@cluster0.jg55y.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        const users = [
            {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin',
            },
            {
                username: 'manager',
                password: await bcrypt.hash('manager123', 10),
                role: 'manager',
            },
            {
                username: 'engineer',
                password: await bcrypt.hash('engineer123', 10),
                role: 'engineer',
            },
        ];

        await User.deleteMany({});
        await User.insertMany(users);

        console.log('Users seeded successfully!');
        mongoose.connection.close();
    } catch (error) {
        console.error('Error seeding users:', error);
        mongoose.connection.close();
    }
};

seedUsers();
