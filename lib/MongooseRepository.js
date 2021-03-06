const IRepository = require('./IRepository');

class MongooseRepository extends IRepository {
  constructor(mongoose, model) {
    super(...arguments);

    if (!mongoose || !model) throw new Error('Mongoose model type cannot be null.');
    this.mongoose = mongoose;

    if (typeof model === 'string') {
      this.collection = mongoose.model(model);
    } else {
      this.collection = model;
    }

    this.add = this.add.bind(this);
    this.findAll = this.findAll.bind(this);
    this.findOne = this.findOne.bind(this);
    this.patch = this.patch.bind(this);
    this.remove = this.remove.bind(this);
    this.update = this.update.bind(this);

    this.clear = this.clear.bind(this);
    this.disconnect = this.disconnect.bind(this);
  }

  clear(cb) {
    this.collection.find({}).remove(cb);
  }

  disconnect(cb) {
    this.mongoose.connection.close(cb);
  }

  /**
   * Finds all instances in the collection.
   * @param {function} cb - callback
   * @returns {void}
   */
  findAll(cb) {
    this.collection.find({}).exec((err, res) => {
      if (err) return cb(err);
      const obj = JSON.parse(JSON.stringify(res));
      return cb(null, obj);
    });
  }

  /**
   * Find an object.
   * @param {string} id - Object Id
   * @param {function} cb - callback
   * @returns {void}
   */
  findOne(id, cb) {
    const self = this;
    self.collection.findOne({
      _id: id
    }).lean().exec((err, res) => {
      if (err) { return cb(err); }
      cb(null, JSON.parse(JSON.stringify(res)));
    });
  }

  /**
   * Create
   * @param {object} entity - Object to create.
   * @param {function} cb - callback
   * @returns {void}
   */
  add(entity, cb) {
    this.collection.create(entity, (err, res) => {
      if (err) return cb(err);
      const obj = JSON.parse(JSON.stringify(res));
      cb(null, obj);
    });
  }

  /**
   * Partially update an object.
   * @param {string} id - Object Id
   * @param {object} obj - Key/Value pairs to update
   * @param {function} cb - callback
   * @returns {void}
   */
  patch(id, obj, cb) {
    this.collection.findOneAndUpdate(
      { _id: id },
      { $set: obj },
      { new: true, lean: true },
      (err, res) => {
        if (err) { return cb(err); }
        const obj = JSON.parse(JSON.stringify(res));
        cb(null, obj);
      });
  }

  /**
   * Update
   * @returns {void}
   */
  update(entity, cb) {
    const self = this;
    self.collection.findByIdAndUpdate(entity._id, entity, {
      new: true,
      passRawResult: true,
      lean: true
    }).exec((err, res) => {
      if (err) { return cb(err); }
      const obj = JSON.parse(JSON.stringify(res));
      cb(null, obj);
    });
  }

  /**
   * delete
   */
  remove(id, cb) {
    this.collection.findByIdAndRemove(id, (err, res) => {
      if (err) return cb(err);
      const obj = JSON.parse(JSON.stringify(res));
      cb(null, obj);
    });
  }
}

module.exports = MongooseRepository;
