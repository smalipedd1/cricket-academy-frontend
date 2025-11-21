import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NotificationBell from './NotificationBell';

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({});
  const [dob, setDob] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [contactUpdates, setContactUpdates] = useState({});
  const [sessions, setSessions] = useState([]);
  const [feedback, setFeedback] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [feedbackStartDate, setFeedbackStartDate] = useState('');
  const [feedbackEndDate, setFeedbackEndDate] = useState('');
  const [showUnrespondedOnly, setShowUnrespondedOnly] = useState(false);
  const [activeSection, setActiveSection] = useState('profile');
  const [evaluations, setEvaluations] = useState([]);

  const token = localStorage.getItem('token');

  const calculateAge = (dob) => {
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };
        {activeSection === 'feedback' && (
          <div className="bg-white rounded-xl shadow p-6 space-y-6">
            <h2 className="text-2xl font-semibold text-blue-600">Session Feedback</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="date"
                value={feedbackStartDate}
                onChange={(e) => setFeedbackStartDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <input
                type="date"
                value={feedbackEndDate}
                onChange={(e) => setFeedbackEndDate(e.target.value)}
                className="border px-4 py-2 rounded"
              />
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={showUnrespondedOnly}
                  onChange={(e) => setShowUnrespondedOnly(e.target.checked)}
                  className="h-4 w-4"
                />
                <span className="text-sm text-gray-700">Show only unresponded</span>
              </label>
            </div>

            {feedback
              .filter((fb) => {
                const sessionDate = new Date(fb.sessionDate);
                const start = feedbackStartDate ? new Date(feedbackStartDate) : null;
                const end = feedbackEndDate ? new Date(feedbackEndDate) : null;
                const withinDateRange =
                  (!start || sessionDate >= start) &&
                  (!end || sessionDate <= end);
                const matchesResponseFilter =
                  !showUnrespondedOnly || !fb.playerResponse;
                return withinDateRange && matchesResponseFilter;
              })
              .map((fb) => (
                <div key={fb.sessionId} className="border p-4 rounded mb-4 bg-gray-50">
                  <h3 className="text-lg font-semibold text-blue-700">
                    Session on {new Date(fb.sessionDate).toLocaleDateString()}
                  </h3>
                  <p><strong>Focus Area:</strong> {fb.focusArea}</p>
                  <p><strong>Coach Notes:</strong> {fb.notes}</p>
                  <p><strong>Coach Rating:</strong></p>
                  <ul className="list-disc ml-6">
                    {Object.entries(fb.rating || {}).map(([skill, value]) => (
                      <li key={skill}>{skill}: {value}</li>
                    ))}
                  </ul>
                  <p><strong>Your Response:</strong> {fb.playerResponse || 'No response yet'}</p>

                  {!fb.playerResponse && (
                    <>
                      <textarea
                        placeholder="Write your response..."
                        value={selectedSessionId === fb.sessionId ? responseText : ''}
                        onChange={(e) => {
                          setSelectedSessionId(fb.sessionId);
                          setResponseText(e.target.value);
                        }}
                        className="border w-full p-2 mt-2 rounded"
                      />
                      <button
                        onClick={() => handleResponseSubmit(fb.sessionId)}
                        className="mt-2 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                      >
                        Submit Response
                      </button>
                    </>
                  )}
                </div>
              ))}
          </div>
        )}
        {/* Profile Section */}
        {activeSection === 'profile' && (
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-semibold text-blue-600 mb-4">My Profile</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <p><strong>First Name:</strong> {profile.firstName}</p>
              <p><strong>Last Name:</strong> {profile.lastName}</p>
              {dob && (
                <>
                  <p><strong>Date of Birth:</strong> {new Date(dob).toLocaleDateString()}</p>
                  <p><strong>Age:</strong> {calculateAge(dob)}</p>
                </>
              )}
              <p><strong>Role:</strong> {profile.role}</p>
              <p><strong>Academy Level:</strong> {profile.academyLevel}</p>
              <p><strong>CricClubs ID:</strong> {profile.cricclubsID}</p>
              <p><strong>Status:</strong> {profile.status}</p>

              {editMode ? (
                <>
                  <input
                    type="email"
                    name="emailAddress"
                    placeholder="Email"
                    defaultValue={profile.emailAddress}
                    onChange={handleContactChange}
                    className="border px-3 py-2 rounded"
                  />
                  <button
                    onClick={handleContactSave}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Save
                  </button>
                </>
              ) : (
                <>
                  <p><strong>Email:</strong> {profile.emailAddress}</p>
                  <button
                    onClick={() => setEditMode(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                  >
                    Edit Email
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;