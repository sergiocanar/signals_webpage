import os
import json
import numpy as np
import scipy.io as sio


this_dir = os.path.dirname(os.path.abspath(__file__))
ECG_path = os.path.join(this_dir, "ECGData.mat")

ECG_data = sio.loadmat(ECG_path)
t0 = 44000
data_len = 1600
tf = t0 + data_len
ECG_signal = np.double(ECG_data["m_Data"][0])[t0:tf]
sample_rate = ECG_data["s_Freq"][0][0]
sample_period = 1 / sample_rate
time_array = np.arange(np.size(ECG_signal)) / sample_rate
time_array = np.array(time_array)

ECG_signal_list = ECG_signal.tolist()

with open(os.path.join(this_dir, 'ECG_signal.json'), 'w') as json_file:
    json.dump(ECG_signal_list, json_file)