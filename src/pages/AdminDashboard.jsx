{(selectedCoach || isAddingCoach) && (
  <div className="mt-6 space-y-4">
    <h3 className="text-lg font-semibold text-blue-600">
      {isAddingCoach ? 'Add New Coach' : 'Edit Coach'}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label>
        Username
        <input
          type="text"
          value={editedCoach.username}
          onChange={(e) => setEditedCoach({ ...editedCoach, username: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={editedCoach.password}
          onChange={(e) => setEditedCoach({ ...editedCoach, password: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        First Name
        <input
          type="text"
          value={editedCoach.firstName}
          onChange={(e) => setEditedCoach({ ...editedCoach, firstName: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Last Name
        <input
          type="text"
          value={editedCoach.lastName}
          onChange={(e) => setEditedCoach({ ...editedCoach, lastName: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Specialization
        <select
          value={editedCoach.specialization}
          onChange={(e) => setEditedCoach({ ...editedCoach, specialization: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="">Select</option>
          <option value="Batting">Batting</option>
          <option value="Bowling">Bowling</option>
          <option value="Fitness">Fitness</option>
          <option value="Fielding">Fielding</option>
          <option value="Wicketkeeping">Wicketkeeping</option>
        </select>
      </label>
      <label>
        Phone Number
        <input
          type="text"
          value={editedCoach.phoneNumber}
          onChange={(e) => setEditedCoach({ ...editedCoach, phoneNumber: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Email Address
        <input
          type="email"
          value={editedCoach.emailAddress}
          onChange={(e) => setEditedCoach({ ...editedCoach, emailAddress: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Status
        <select
          value={editedCoach.status}
          onChange={(e) => setEditedCoach({ ...editedCoach, status: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
        </select>
      </label>
    </div>
    <button
      onClick={handleCoachUpdate}
      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
    >
      {isAddingCoach ? 'Save New Coach' : 'Update Coach'}
    </button>
  </div>
)}
{(selectedPlayer || isAddingPlayer) && (
  <div className="mt-6 space-y-4">
    <h3 className="text-lg font-semibold text-green-600">
      {isAddingPlayer ? 'Add New Player' : 'Edit Player'}
    </h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label>
        Username
        <input
          type="text"
          value={editedPlayer.username}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, username: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Password
        <input
          type="password"
          value={editedPlayer.password}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, password: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        First Name
        <input
          type="text"
          value={editedPlayer.firstName}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, firstName: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Last Name
        <input
          type="text"
          value={editedPlayer.lastName}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, lastName: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Role
        <select
          value={editedPlayer.role}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, role: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="Batsman">Batsman</option>
          <option value="Bowler">Bowler</option>
          <option value="All-Rounder">All-Rounder</option>
          <option value="Wicketkeeper">Wicketkeeper</option>
        </select>
      </label>
      <label>
        Academy Level
        <select
          value={editedPlayer.academyLevel}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, academyLevel: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="Beginner">Beginner</option>
          <option value="Intermediate">Intermediate</option>
          <option value="Advanced">Advanced</option>
        </select>
      </label>
      <label>
        Email Address
        <input
          type="email"
          value={editedPlayer.emailAddress}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, emailAddress: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Cricclubs ID
        <input
          type="text"
          value={editedPlayer.cricclubsID}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, cricclubsID: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        />
      </label>
      <label>
        Status
        <select
          value={editedPlayer.status}
          onChange={(e) => setEditedPlayer({ ...editedPlayer, status: e.target.value })}
          className="border px-3 py-2 rounded w-full"
        >
          <option value="Active">Active</option>
          <option value="Inactive">Inactive</option>
          <option value="Suspended">Suspended</option>
          <option value="Graduated">Graduated</option>
        </select>
      </label>
    </div>
    <button
      onClick={handlePlayerUpdate}
      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
    >
      {isAddingPlayer ? 'Save New Player' : 'Update Player'}
    </button>
  </div>
)}
              <button
                onClick={handleLogout}
                className="mt-6 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
              >
                Logout
              </button>
            </>
          ) : (
            <p>Loading dashboard...</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminDashboard;