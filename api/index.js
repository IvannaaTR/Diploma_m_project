const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Initiantive = require('./models/Initiantive.js');
const Recommendation = require('./models/Recommendation.js');
const Observation = require('./models/Observation.js');
const AirStation = require('./models/AirStation.js');
const cookieParser = require('cookie-parser');
const multer = require('multer');
require('dotenv').config();
const app= express();
const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = process.env.JWT_SECRET;
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const {sub} = require('date-fns');
const cloudinary = require('./cloudinaryConfig');
const axios = require('axios');

mongoose.connect(process.env.MONGO_URL);

app.use(express.json());
app.use(cookieParser());

app.use(cors({
    credentials: true, 
    origin: 'http://localhost:5173', 
  }));

app.get('/test',(req,res)=>{
    res.json('Test ok')

});
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, 
  auth: {
      user: process.env.EMAIL, 
      pass: process.env.PASSWORD   
  }
});

app.post('/forgotpass', async (req,res) => {
  const { email } = req.body;
  try {
      const user = await User.findOne({ email });
      if (!user) {
          console.error('Користувач не знайдений:', e);
          return res.status(404).send('Користувач не знайдений');
      }

      const token = crypto.randomBytes(20).toString('hex');
      user.resetPasswordToken = token;
      user.resetPasswordExpires = Date.now() + 3600000; 
      try {
        await user.save();
        console.log('User updated:');
      }catch (err) {
        console.error('Не створено:', e);
        res.status(500).send('Сталася помилка, спробуйте ще раз.');
     }
     const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
      const mailOptions = {
        from: `"My City App" <${process.env.EMAIL}>`,
          to: user.email,
          subject: 'Інструкції для відновлення паролю',
          text: `Ви отримали цей лист, оскільки хтось (або ви) запросив відновлення паролю для вашого акаунта.\n\n
              Будь ласка, натисніть на наступне посилання або вставте його в браузер для завершення процесу:\n\n
              ${BASE_URL}/reset/${token}\n\n
              Якщо ви не запитували це, будь ласка, проігноруйте цей лист, і ваш пароль залишиться незмінним.\n`
      };
      try {
        console.log('Mail');
        await transporter.sendMail(mailOptions);
        console.log('Mail');
      }catch (err) {
        console.error('Не надіслано:', e);
      }
      res.status(200).send('Лист для відновлення паролю надіслано на вашу електронну адресу.');
  } catch (err) {
      res.status(500).send('Сталася помилка, спробуйте ще раз.');
  }
});
app.post('/resetpassword', async (req, res) => {
  const { token, newPassword } = req.body;
  const passwordRequirements = /^(?=.*\d)(?=.*[A-Z])(?=.*\W).{8,}$/;
  if (!passwordRequirements.test(newPassword)) {
    return res.status(400).send('Пароль повинен містити щонайменше 8 символів, одну велику літеру, одну цифру і один спеціальний символ.');
  }
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).send('Токен недійсний або його термін дії минув.');
    }
    const hashedPassword =  bcrypt.hashSync(newPassword, bcryptSalt);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    res.status(200).send('Пароль успішно змінено.');
  } catch (err) {
    console.error('Помилка зміни пароля:', err);
    res.status(500).send('Сталася помилка, спробуйте ще раз.');
  }
});
app.post('/register', async (req,res) => {
    const {name,email,password} = req.body;
    try {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Користувач з таким електронним адресом вже існує.' });
        }

        const token = crypto.randomBytes(20).toString('hex');
        const userDoc = await User.create({
          name,
          email,
          password:bcrypt.hashSync(password, bcryptSalt),
          verificationToken: token,
          verificationExpires: Date.now() + 3600000
        });
        const BASE_URL = process.env.BASE_URL || 'http://localhost:5173';
        const mailOptions = {
          from: `"My City App" <${process.env.EMAIL}>`,
          to: email,
          subject: 'Підтвердження реєстрації',
          text: `Ви зареєструвалися у веб-застосунку "My City App". Щоб підтвердити свою електронну адресу, натисніть на посилання:\n\n
                ${BASE_URL}/verify/${token}\n\n
                Якщо ви не реєструвалися, проігноруйте цей лист.\n`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Лист для підтвердження надіслано на вашу електронну адресу.' });
    } catch (e) {
      return res.status(400).json({ error: 'Не вдалось зареєструватися.' });
    }
  
});
app.get('/verify/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const user = await User.findOne({
      verificationToken: token,
      verificationExpires: { $gt: Date.now() }
    });
    if (!user) {
      return res.status(400).send('Недійсний токен або його термін дії минув.');
    }
    user.isVerified = true;
    user.verificationToken = undefined; // Видаляємо токен після підтвердження
    user.verificationExpires = undefined;
    await user.save();
    res.status(200).send('Ваша електронна адреса успішно підтверджена! Тепер ви можете увійти в систему.');
  } catch (err) {
    console.error('Помилка підтвердження електронної адреси:', err);
    res.status(500).send('Сталася помилка');
  }
});
app.post('/login', async (req,res) => {
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    if (userDoc.isBlocked) {
      const blockedUntil = new Date(userDoc.isBlocked);
      const currentDate = new Date();

      if (blockedUntil > currentDate) {
        return res.status(403).json({ error: 'Ваш акаунт заблокований.' });
      } else {
        userDoc.isBlocked = null;
        await userDoc.save();
      }
    }
    if (!userDoc.isVerified) {
      return res.status(403).json({ error: 'Вам потрібно підтвердити Вашу електронну адресу перед входом.' });
    }
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id,
        isAdmin: userDoc.isAdmin
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      return res.status(422).json({ error: 'Невірний логін або пароль' });
    }
  } else {
    return res.status(422).json({ error: 'Користувача не знайдено' });
  }
});

app.get('/info', (req,res) => {
const {token} = req.cookies;
if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const {name,email,_id,isAdmin,coeficient,selectedStation } = await User.findById(userData.id);
    res.json({name,email,_id,isAdmin,coeficient,selectedStation });
    });
} else {
    res.json(null);
}
});

app.get('/users', (req,res) => {
  const {token} = req.cookies;
  if (token) {
      jwt.verify(token, jwtSecret, {}, async (err, userData) => {
        if (err) {
          return res.status(401).json({ error: 'Невалідний токен' });
        }
        if (!userData.isAdmin) {
          return res.status(403).json({ error: 'Ви не маєте доступу до користувачів' });
        }
        const users = await User.find(
          { _id: { $ne: userData.id } }, 
          '_id email name coeficient isBlocked'
        ).sort({ coeficient: -1 });
        const usersWithObservations = await Promise.all(
          users.map(async (userItem) => {
            const totalObservations = await Observation.countDocuments({ owner: userItem._id });
            const verifiedObservations = await Observation.countDocuments({ owner: userItem._id, status: 'Верифіковано' });
  
            return {
              ...userItem.toObject(),
              totalObservations,       
              verifiedObservations,    
            };
          })
        );
        res.json(usersWithObservations);
        });
  } else {
      res.json(null);
  }
  });
app.put('/user/station', async (req,res) => {
  const {token} = req.cookies;
  const { selectedStation } = req.body;
  if (!selectedStation) {
    return res.status(400).json({ error: 'Не вказано станцію для збереження' });
  }
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    try {
      const user = await User.findById(userData.id);
      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }
      user.selectedStation = selectedStation;
      await user.save();
      res.json({ "success": true, message: 'Дані успішно збережено' });
    } catch (error) {
      res.status(500).json({ error: 'Сталася помилка при збереженні' });
    }
  });
});


app.put('/user/confirm', async (req, res) => {
  const { token } = req.cookies;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Не вказано ID користувача' });
  }

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    if (!userData.isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до користувачів' });
    }
    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }
      user.coeficient = 3;
      await user.save();

      res.json({"success": true, message: 'Користувача підтверджено, коефіцієнт встановлено на 3' });
    } catch (error) {
      res.status(500).json({ error: 'Сталася помилка при підтвердженні користувача' });
    }
  });
});

app.put('/user/block', async (req, res) => {
  const { token } = req.cookies;
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ error: 'Не вказано ID користувача' });
  }

  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }

    if (!userData.isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до користувачів' });
    }

    try {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Користувача не знайдено' });
      }
      const blockDate = new Date();
      blockDate.setMonth(blockDate.getMonth() + 1); 

      user.isBlocked = blockDate.toISOString(); 
      user.coeficient = 1; 
      await user.save();
      res.json({ "success": true, message: 'Користувача заблоковано, коефіцієнт встановлено на 1' });
    } catch (error) {
      res.status(500).json({ error: 'Сталася помилка при блокуванні користувача' });
    }
  });
});

app.post('/logout', (req,res) => {
  res.cookie('token', '').json(true);
});
const upload = multer({ storage: multer.memoryStorage() });
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const file = req.file;
    const result = await cloudinary.uploader.upload_stream(
      { 
        upload_preset: 'myCity' 
      },
      (error, result) => {
        if (error) return res.status(500).json({ error: 'Cloudinary upload failed' });
        res.json({ url: result.secure_url });
      }
    );
    result.end(file.buffer);
  } catch (error) {
    res.status(500).json({ error: 'Upload failed' });
  }
});
app.post('/delete-photos', async (req, res) => {
  const { photos } = req.body;
  try {
    const deletePromises = photos.map(photo =>
      cloudinary.uploader.destroy(photo.split('/').pop().split('.')[0])
    );
    await Promise.all(deletePromises);
    res.json({ message: 'Photos deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete photos' });
  }
});



app.get('/user-initiantives', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    res.json(await Initiantive.find({ owner: userId }).sort({ createdAt: -1 }));
  });
});

app.post('/initiantives', (req,res) => {
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,
    extraInfo,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const initiantiveDoc = await Initiantive.create({
      owner:userData.id,
      title,address,photos:addedPhotos,description,
      extraInfo,
    });
    res.json(initiantiveDoc);
  });
});

app.get('/initiantives/:id', async (req,res) => {
  const {token} = req.cookies;
  const { id: initiativeId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    const initiative = await Initiantive.findById(initiativeId);
    if (!initiative) {
      return res.status(404).json({ error: 'Ініціативу не знайдено' });
    }
    if (initiative.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Ви не маєте доступу до ініціатив' });
    }
    res.json(initiative);
  });
});

app.put('/initiantives', async (req,res) => {
  const {token} = req.cookies;
  const {
    id, title,address,addedPhotos,description,
    extraInfo,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const initiative = await Initiantive.findById(id);
    if (!initiative) {
      return res.status(404).json({ error: 'Ініціативу не знайдено' });
    }
    if (userData.id === initiative.owner.toString()) {
      initiative.set({
        title,address,photos:addedPhotos,description,
        extraInfo,
      });
      await initiative.save();
      res.json('ok');
    }
  });
});

app.delete('/initiantives/:id', async (req, res) => {
  const {token} = req.cookies;
  const { id: initiativeId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    const initiative = await Initiantive.findById(initiativeId);
    if (!initiative) {
      return res.status(404).json({ error: 'Рекомендацію не знайдено' });
    }
    if (initiative.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Ви не маєте доступу до рекомендацій' });
    }
    const photoUrls = initiative.photos; 
    
    const deletePromises = photoUrls.map((photoUrl) => {
      const publicId = photoUrl.split('/').pop().split('.')[0];
      return cloudinary.uploader.destroy(publicId);
    });

    try {
      await Promise.all(deletePromises);
      await Initiantive.findByIdAndDelete(initiativeId);
      res.json({ message: 'Ініціативу та фото успішно видалено', initiativeId });
    } catch (error) {
      console.error('Помилка при видаленні фото з Cloudinary:', error);
      res.status(500).json({ error: 'Помилка при видаленні фото з Cloudinary' });
    }
  });
});

app.get('/initiantives', async (req,res) => {
  res.json( await Initiantive.find().sort({ createdAt: -1 }) );
});
app.get('/ginitiantive/:id', async (req,res) => {
  const { id: initiativeId } = req.params;
  const initiative = await Initiantive.findById(initiativeId);
    if (!initiative) {
      return res.status(404).json({ error: 'Ініціативу не знайдено' });
    }
    res.json(initiative);
});


app.get('/user-recommendations', (req,res) => {
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    res.json(await Recommendation.find({ owner: userId }).sort({ createdAt: -1 }));
  });
});
// 
app.post('/recommendations', (req,res) => {
  const {token} = req.cookies;
  const {
    title,addedPhotos,description,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const recommendationDoc = await Recommendation.create({
      owner:userData.id,
      title,photos:addedPhotos,description,
    });
    res.json(recommendationDoc);
  });
});
app.get('/recommendations/:id', async (req,res) => {
  const {token} = req.cookies;
  const { id: recommendationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: 'Рекомендацію не знайдено' });
    }
    if (recommendation.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Ви не маєте доступу до рекомендацій' });
    }
    res.json(recommendation);
  });
});

app.put('/recommendations', async (req,res) => {
  const {token} = req.cookies;
  const {
    id, title,addedPhotos,description,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const recommendation = await Recommendation.findById(id);
    if (!recommendation) {
      return res.status(404).json({ error: 'Рекомендації не знайдено' });
    }
    if (userData.id === recommendation.owner.toString()) {
      recommendation.set({
        title,photos:addedPhotos,description,
      });
      await recommendation.save();
      res.json('ok');
    }
  });
});
app.delete('/recommendations/:id', async (req, res) => {
  const {token} = req.cookies;
  const { id: recommendationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId} = userData;
    const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: 'Рекомендацію не знайдено' });
    }
    if (recommendation.owner.toString() !== userId) {
      return res.status(403).json({ error: 'Ви не маєте доступу до рекомендацій' });
    }
    const photoUrls = recommendation.photos; 
  
    const deletePromises = photoUrls.map((photoUrl) => {
      const publicId = photoUrl.split('/').pop().split('.')[0];
      return cloudinary.uploader.destroy(publicId);
    });

    try {
      await Promise.all(deletePromises);
      await Recommendation.findByIdAndDelete(recommendationId);
      res.json({ message: 'Рекомендацію та фото успішно видалено', recommendationId });
    } catch (error) {
      console.error('Помилка при видаленні фото з Cloudinary:', error);
      res.status(500).json({ error: 'Помилка при видаленні фото з Cloudinary' });
    }
  });
});

app.get('/recommendations', async (req,res) => {
  res.json( await Recommendation.find().sort({ createdAt: -1 }) );
});
app.get('/grecommendation/:id', async (req,res) => {
  const { id: recommendationId } = req.params;
  const recommendation = await Recommendation.findById(recommendationId);
    if (!recommendation) {
      return res.status(404).json({ error: 'Рекомендацію не знайдено' });
    }
    res.json(recommendation);
});

app.get('/user-observations', (req,res) => {
  const {token} = req.cookies;
  const { sort, category, ownerId } = req.query;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId, isAdmin } = userData;
    let query = {};

    if (!isAdmin) {
      query.owner = userId;
    }

    if (ownerId) {
      query.owner = ownerId;
    }

    if (category) {
      query.category = category;
    }

    let sortOptions = {};
    if (sort === 'date_desc') {
      sortOptions.createdAt = -1; 
    } else if (sort === 'date_asc') {
      sortOptions.createdAt = 1; 
    } else if (sort === 'verified') {
      sortOptions.status = -1; 
    } else if (sort === 'unverified') {
      sortOptions.status = 1; 
    } 
    try {
      const observations = await Observation.find(query).sort(sortOptions);
      if (isAdmin) {
      const observationsWithEmails = await Promise.all(observations.map(async (observation) => {
        const owner = await User.findById(observation.owner);
        return {
          ...observation.toObject(),
          ownerEmail: owner ? owner.email : 'Email не знайдено'
        };
      }));
      res.json(observationsWithEmails);}
      else{
        res.json(observations);
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Помилка сервера' });
    }
  });
});


async function updateUserCoefficient(userId) {
  const user = await User.findById(userId);
  if (!user || user.coeficient !== 1) return;

  const totalObservations = await Observation.countDocuments({ owner: userId });
  const verifiedObservations = await Observation.countDocuments({
    owner: userId,
    status: 'Верифіковано'
  });

  const verificationRate = (verifiedObservations / totalObservations) * 100;

  if (totalObservations >= 10 && verificationRate >= 80) {
    user.coeficient = 2;
    await user.save(); 
  }
}
function getObservationLimit(coeficient) {
  switch (coeficient) {
    case 1:
      return 1;
    case 2:
      return 3;
    case 3:
      return Infinity; 
    default:
      throw new Error('Невірний коефіцієнт');
  }
}
app.post('/observations', (req,res) => {
  const {token} = req.cookies;
  const {
    category,latitude, longitude, addedPhotos, mark, area, description,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const user = await User.findById(userData.id);
    if (!user) {
      return res.status(404).json({ error: 'Користувача не знайдено' });
    }
    const startDate = sub(new Date(), { hours: 24 });
    const observationCount = await Observation.countDocuments({
      owner: userData.id,
      createdAt: { $gte: startDate }
    });

    let limit;
    console.log(user.coeficient)
    try {
      limit = getObservationLimit(user.coeficient);
    } catch (error) {
      return res.status(400).json({ error: error.message });
    }
    if (observationCount >= limit) {
      return res.status(429).json({ error: 'Спостереження не додано, оскільки ліміт на добу вичерпано. Спробуйте будь ласка пізніше!' });
    }
    const observationDoc = await Observation.create({
      owner:userData.id,
      category,latitude, longitude, photos:addedPhotos,mark, area, description,
    });
    await updateUserCoefficient(userData.id);
    res.json(observationDoc);
  });
});

app.get('/observations/:id', async (req,res) => {
  const {token} = req.cookies;
  const { id: observationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId, isAdmin } = userData;
    const observation = await Observation.findById(observationId);
    if (!observation) {
      return res.status(404).json({ error: 'Спостереження не знайдено' });
    }
    if (observation.owner.toString() !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до цього спостереження' });
    }
    res.json(observation);
  });
});

app.put('/observations', async (req,res) => {
  const {token} = req.cookies;
  const {
    id, category,latitude, longitude, addedPhotos, mark, area, description,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const observation = await Observation.findById(id);
    if (!observation) {
      return res.status(404).json({ error: 'Спостереження не знайдено' });
    }
    if (userData.id !== observation.owner.toString()) {
      return res.status(403).json({ error: 'Ви не маєте доступу до редагування цього спостереження' });
    }
    observation.set({
      category,latitude, longitude,photos:addedPhotos,mark, area, description,
    });
    await observation.save();
    res.json('ok');
  });
});
app.put('/observations/verification/:id', async (req,res) => {
  const {token} = req.cookies;
  const { id: observationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const observation = await Observation.findById(observationId);
    if (!observation) {
      return res.status(404).json({ error: 'Спостереження не знайдено' });
    }
    if (!userData.isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до верифікації спостережень' });
    }
    observation.status = "Верифіковано";
    await observation.save();
    await updateUserCoefficient(observation.owner);
    res.json('ok');
  });
});
app.put('/observations/actualization/:id', async (req,res) => {
  const {token} = req.cookies;
  const { id: observationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const observation = await Observation.findById(observationId);
    if (!observation) {
      return res.status(404).json({ error: 'Спостереження не знайдено' });
    }
    if (!userData.isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до актуалізації спостережень' });
    }
    observation.isVisible = false;
    await observation.save();
    res.json('ok');
  });
});
app.delete('/observations/:id', async (req, res) => {
  const {token} = req.cookies;
  const { id: observationId } = req.params;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) {
      return res.status(401).json({ error: 'Невалідний токен' });
    }
    const { id: userId, isAdmin } = userData;
    const observation = await Observation.findById(observationId);
    if (!observation) {
      return res.status(404).json({ error: 'Спостереження не знайдено' });
    }
    if (observation.owner.toString() !== userId && !isAdmin) {
      return res.status(403).json({ error: 'Ви не маєте доступу до цього спостереження' });
    }
    const photoUrls = observation.photos; 
    const deletePromises = photoUrls.map((photoUrl) => {
      const publicId = photoUrl.split('/').pop().split('.')[0];
      return cloudinary.uploader.destroy(publicId);
    });

    try {
      await Promise.all(deletePromises);
      await Observation.findByIdAndDelete(observationId);
      res.json({ message: 'Спостереження успішно видалено', observationId });
    } catch (error) {
      console.error('Помилка при видаленні фото з Cloudinary:', error);
      res.status(500).json({ error: 'Помилка при видаленні фото з Cloudinary' });
    }
  });
});



app.get('/observations', async (req,res) => {
  res.json( await Observation.find() );
});
// 

app.get('/observations-summary', async (req, res) => {
  try {
    const twoHoursAgo = sub(new Date(), { hours: 2 });
    const totalAirStations = await AirStation.countDocuments({
      createdAt: { $gte: twoHoursAgo } 
    }).sort({ createdAt: -1 });
    const totalObservations = await Observation.countDocuments();
    const verifiedObservations = await Observation.countDocuments({ status: 'Верифіковано' });
    const correctedObservations = await Observation.countDocuments({ isVisible: false });

    const verifiedPercentage = (verifiedObservations / totalObservations) * 100;
    const correctedPercentage = (correctedObservations / totalObservations) * 100;

    res.json({
      totalStations: totalAirStations, 
      totalObservations,
      verifiedPercentage,
      correctedPercentage
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/maps/category', async (req, res) => {
  const { category } = req.query;
  try {
    if (!category) {
      return res.status(400).json({ error: 'Category is required' });
    }
    let observations;
    if (category === 'Станції') {
      const twoHoursAgo = sub(new Date(), { hours: 2 });
      observations = await AirStation.find({ createdAt: { $gte: twoHoursAgo } }).sort({ createdAt: -1 });
    } else {
      observations = await Observation.find({ category, isVisible: true });
    }

    if (!observations || observations.length === 0) {
      return res.status(404).json({ error: 'No observations found for the specified criteria.' });
    }

    res.json(observations);
  } catch (error) {
    console.error('Error fetching observations by category:', error);
    res.status(500).json({ error: 'Error fetching observations', message: error.message });
  }
});

app.get('/maps/station', async (req, res) => {
  const { stationName } = req.query;
  try {
    if (!stationName) {
      return res.status(400).json({ error: 'Station name is required' });
    }

    const startDate = sub(new Date(), { hours: 48 });
    const observations = await AirStation.find({
      stationName,
      createdAt: { $gte: startDate },
    });

    if (!observations || observations.length === 0) {
      return res.status(404).json({ error: 'No observations found for the specified station.' });
    }

    res.json(observations);
  } catch (error) {
    console.error('Error fetching observations by station:', error);
    res.status(500).json({ error: 'Error fetching observations', message: error.message });
  }
});

app.get('/maps/csv', async (req, res) => {
  const { csvstationName } = req.query;
  try {
    if (!csvstationName) {
      return res.status(400).json({ error: 'CSV station name is required' });
    }

    const observations = await AirStation.find({ stationName: csvstationName });

    if (!observations || observations.length === 0) {
      return res.status(404).json({ error: 'No CSV data found for the specified station.' });
    }

    res.json(observations);
  } catch (error) {
    console.error('Error fetching CSV data:', error);
    res.status(500).json({ error: 'Error fetching CSV data', message: error.message });
  }
});

app.post('/observations/:id/rate', async (req, res) => {
  const { id } = req.params;
  const { userId, type, coefficient } = req.body; // type може бути 'overall' або 'relevance'
  
  try {
    const observation = await Observation.findById(id);
    const user = await User.findById(userId);

    if (!observation || !user) {
      return res.status(404).json({ error: 'Спостереження або користувач не знайдені' });
    }
    const numericCoefficient = parseFloat(coefficient);
    if (isNaN(numericCoefficient)) {
      return res.status(400).json({ error: 'Невірне значення коефіцієнта' });
    }
 
    if (type === 'overall') {
      if (observation.ratedBy.includes(userId)) {
        return res.status(400).json({ error: 'Ви вже оцінювали це спостереження' });
      }

      observation.overallRating += coefficient;
      observation.ratedBy.push(userId); 

    } else if (type === 'relevance') {
      if (observation.relevanceRatedBy.includes(userId)) {
        return res.status(400).json({ error: 'Ви вже оцінювали релевантність цього спостереження' });
      }

      observation.relevanceRating += coefficient;
      observation.relevanceRatedBy.push(userId); 
    }
    if (observation.overallRating > 6) {
      observation.status = 'Верифіковано';
      await updateUserCoefficient(observation.owner);
    } else if (observation.overallRating <= -9) {
      await observation.deleteOne();
      return res.json({ message: 'Спостереження видалено через негативний рейтинг' });
    }

    if (observation.relevanceRating > 6) {
      observation.isVisible = false;
    }
    await observation.save();
    res.json({ message: 'Оцінка збережена, для відображення оновіть сторінку', observation });
  } catch (error) {
    res.status(500).json({ error: error.message});
  }
});


const getAQIColor = (AQI) => {
  if (AQI >= 1 && AQI <= 50) {
    return 'limegreen'; // Bright green
  } else if (AQI >= 51 && AQI <= 100) {
    return 'palegreen'; // Light green
  } else if (AQI >= 101 && AQI <= 150) {
    return 'lightsalmon'; // Light orange
  } else if (AQI >= 151 && AQI <= 200) {
    return 'orangered'; // Orange-red
  } else if (AQI >= 201 && AQI <= 300) {
    return 'red'; // Red
  } else {
    return 'maroon'; // Burgundy for ratings above 300
  }
};

const getObservationColor = (mark) => {
  switch (mark) {
    case 1:
      return 'yellow'; // Yellow
    case 2:
      return 'orange'; // Orange
    case 3:
      return 'orangered'; // Orange-red
    case 4:
      return 'red'; // Red
    default:
      return 'gray'; // Default color
  }
};

app.get('/api/mapData', async (req, res) => {
  try {
    const twoHoursAgo = sub(new Date(), { hours: 2 });
    const airStations = await AirStation.find({
      createdAt: { $gte: twoHoursAgo } 
    }).sort({ createdAt: -1 });
    const observations = await Observation.find({
      status: 'Верифіковано',   
      isVisible: true,      
      area: { $exists: true, $ne: null }  
    });

    const stationDataS = airStations.map(station => ({
      id: station._id,
      lat: station.latitude,
      lng: station.longitude,
      area: 10, 
      aqi: station.AQI 
    }));

    const observationDataS = observations.map(obs => ({
      id: obs._id,
      lat: obs.latitude,
      lng: obs.longitude,
      area: obs.area,
      mark: obs.mark 
    }));

    res.json({ stationDataS, observationDataS });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch data' });
  }
});
const processDataAndSave = async () => {
  try {
    const response = await axios.get('https://api.saveecobot.com/output.json');
    const data = response.data;

    const twoHoursAgo = sub(new Date(), { hours: 2 });

    const filteredStations = data.filter((station) => {
      const isCityValid = ['Zhovkva','Lviv', 'Pustomyty','Sambir','Dolishnii Luzhok','Drohobych','Stebnyk'].includes(station.cityName);
      const isDataRecent = station.pollutants.every(
        (pollutant) => new Date(pollutant.time) >= twoHoursAgo
      );

      return isCityValid && isDataRecent;
    });

    const records = filteredStations.map((station) => {
      const pollutants = {};

      station.pollutants.forEach((pollutant) => {
        if (pollutant.pol === 'Humidity') pollutants.humidity = pollutant.value;
        if (pollutant.pol === 'PM10') pollutants.PM10 = pollutant.value;
        if (pollutant.pol === 'PM2.5') pollutants.PM25 = pollutant.value;
        if (pollutant.pol === 'Temperature') pollutants.temperature = pollutant.value;
        if (pollutant.pol === 'Air Quality Index') pollutants.AQI = pollutant.value;
      });

      return {
        latitude: parseFloat(station.latitude),
        longitude: parseFloat(station.longitude),
        stationName: station.stationName,
        cityName:station.cityName,
        AQI: pollutants.AQI,
        pollutants: {
          humidity: pollutants.humidity,
          PM10: pollutants.PM10,
          PM25: pollutants.PM25,
          temperature: pollutants.temperature,
        },
      };
    });

    await AirStation.insertMany(records);
    console.log('Дані успішно збережені!');
    await notifyUsers(records);
  } catch (error) {
    console.error('Помилка:', error);
  } finally {
    
  }
};
async function notifyUsers(records) {
  const users = await User.find({ selectedStation: { $exists: true, $ne: null } }); 
  for (const record of records) {
    if (record.AQI >= 101) {
      const affectedUsers = users.filter(
        (user) => user.selectedStation === record.stationName
      );
      for (const user of affectedUsers) {
        const mailOptions = {
          from: `"My City App" <${process.env.EMAIL}>`,
          to: user.email,
          subject: 'Попередження про якість повітря',
          text: `Шановний(а) ${user.name}, якість повітря на станції "${record.stationName}" перевищила безпечний рівень. Поточний AQI: ${record.AQI}.`,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Повідомлення надіслано до ${user.email}`);
        } catch (error) {
          console.error(`Помилка надсилання повідомлення до ${user.email}`, error);
        }
      }
    }
  }
}
  const INTERVAL = 2 * 60* 60* 1000; 

  setInterval(() => {
    console.log('Запускається процес отримання даних...');
    processDataAndSave();
  }, INTERVAL);
  // processDataAndSave();

app.listen(4000, async () => {
  console.log("server is running");
});