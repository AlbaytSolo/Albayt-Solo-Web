// @ts-nocheck
'use client'
import React, { useEffect, useState } from "react";
import {DATA_BANK} from "@/constants";
import {PackageProps} from "@/Components/Card_Paket";
import {addPurchase, UserAuth} from "@/context/AuthContext";
import {useParams, useRouter} from "next/navigation";
import Image from "next/image";

export interface DewasaData {
    nama: string;
    telp: string;
}
export interface AnakData {
    nama: string;
    tanggalLahir: string;
}

export interface DataPembelian {
    purchaseID: string;
    paketID: string;
    UID?: string;
    email?: string;
    detailJamaah: {
        dewasa: DewasaData[];
        anak: AnakData[];
    };
    metodePembayaran: string;
    totalPembayaran: number;
    tanggalPemesanan: string;
    urlBuktiPembayaran: string;
}

const Order = () => {
   const router = useRouter();
   const params = useParams()
   const { user } = UserAuth()
   const [paketData, setPaketData] = useState<PackageProps>();
   const [dewasaData, setDewasaData] = useState<DewasaData[]>([]);
   const [anakData, setAnakData] = useState<AnakData[]>([]);
   const [selectedPembayaran, setSelectedValue] = React.useState('');
   const [showConfirmation, setShowConfirmation] = useState(false);

    useEffect(() => {
        const data_paket = sessionStorage.getItem('paket');
        if (data_paket) {
            const parsedData = JSON.parse(data_paket);
            const currentPaket = parsedData.find((paket: PackageProps) => paket.paketID === params.title)
            setPaketData(currentPaket);
        }

        const data_jamaah = sessionStorage.getItem('jamaahData')
        if (data_jamaah) {
            const parsedData = JSON.parse(data_jamaah);
            setDewasaData(parsedData.dewasa)
            setAnakData(parsedData.anak)
        }

    }, []);

    const dewasaCount = dewasaData.length
    const anakCount = anakData.length
    const totalHarga = (paketData?.harga_dp ?? 0) * (dewasaCount + anakCount)

    const handleRadioChange = (event) => {
        setSelectedValue(event.target.value);
    };

    const generatePurchaseID = () => {
        const timestamp = new Date().getTime();
        const randomString = Math.random().toString(36).substring(2, 8);
        return `${timestamp}-${randomString}`;
    };

    const handleBayarSekarang = () => {
        if (!selectedPembayaran) {
            alert('Pilih metode pembayaran terlebih dahulu');
            return
        }
        setShowConfirmation(true);
    }

    const handleKonfirmasiPembayaran = async (confirm) => {
        if (confirm) {
            if (paketData && dewasaData.length > 0) {
                const purchaseID = generatePurchaseID()
                const dataPembelian: DataPembelian = {
                    purchaseID: purchaseID,
                    paketID: paketData.paketID,
                    UID: user?.uid,
                    email: user?.email,
                    detailJamaah: {
                        dewasa: dewasaData,
                        anak: anakData
                    },
                    metodePembayaran: selectedPembayaran,
                    totalPembayaran: totalHarga,
                    tanggalPemesanan: new Date().toISOString(),
                    urlBuktiPembayaran: ""
                };

                await addPurchase(dataPembelian)
                sessionStorage.setItem('pilihanPembayaran', selectedPembayaran);
                router.push(`/final-payment/${purchaseID}`)
            } else {
                alert('Data pembelian tidak lengkap');
            }
        } 
        setShowConfirmation(false)
    };

  return (
    <div className="flex flex-col-reverse md:flex-row py-4 max-container padding-container">
      <div className="md:border-r-2 lg:pl-40 md:pr-4 w-full md:w-[65%] border-opacity-50 mr-8 border-[#89060b]">
        <div>
            <div className="border rounded border-[rgba(0,0,0,0.16)] min-h-24 mt-4 justify-center bg-white p-6 shadow">
                <p className="font-bold text-2xl mb-4 text-[#f14310]">
                Total Pembayaran
                </p>
                {((paketData?.harga_dp ?? 0) * (dewasaCount + anakCount)).toLocaleString('id-ID', {
                    style: 'currency',
                    currency: 'IDR'
                })}
            </div>
            <div className="border rounded border-[rgba(0,0,0,0.16)] min-h-24 mt-4 justify-center bg-white p-6 shadow">
                <p className="font-bold text-2xl mb-4 text-[#f14310]">
                    Metode Pembayaran
                </p>
                {DATA_BANK.map((value, index) => (
                    <label key={index} htmlFor={`bayar${index}`} className="items-center">
                        <div className="rounded-md mr-4">
                            <div className="flex justify-between p-4 font-bold text-[#552719]">
                                <div className="flex gap-2 items-center">
                                    <Image src={value.img} alt="logo-bank" width={24} height={24} />
                                    <p className="mr-4">{value.nama}</p>
                                </div>
                                <input
                                    type="radio"
                                    id={`bayar${index}`}
                                    name="pembayaran"
                                    value={value.nama}
                                    onChange={handleRadioChange}
                                    className="w-6 border bg-black"
                                />
                            </div>
                        </div>
                    </label>
                ))}
            </div>
            <div className="my-8 w-full flex justify-end" onClick={handleBayarSekarang}>
                <button className="flex bg-[#89060b] font-bold text-white w-fit rounded-lg p-4">
                    Bayar Sekarang
                </button>
            </div>
        </div>
      </div>
        <div className="sticky md:w-[40%] justify-center">
            <div className="bg-white rounded-md text-black w-full h-fit shadow-md">
                <div className=" text-center font-bold text-2xl my-4 pt-4 text-[#f14310]">
                    Detail Pemesanan
                </div>
                <p className="text-center mx-8 font-bold text-[16px] lg:text-lg mt-4 text-[#89060b]">
                {paketData?.title}
                </p>
                <div className="p-4">
                    <table className="w-full border-collapse">
                        <tbody>
                        <tr>
                            <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">DP
                                Paket
                            </td>
                            <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{dewasaCount + anakCount} Orang</td>
                            <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{paketData?.harga_dp.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR'
                            })}</td>
                        </tr>
                        <tr className="font-bold">
                            <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] text-center lg:text-[16px]"
                                colSpan={2}>Total Biaya
                            </td>
                            <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{totalHarga.toLocaleString('id-ID', {
                                style: 'currency',
                                currency: 'IDR'
                            })}</td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="bg-white rounded-md text-black w-full h-fit shadow-md">
                <div className=" text-center font-bold text-2xl my-4 pt-4 text-[#f14310]">
                    Detail Jamaah
                </div>
                <div className={"pl-4"}>
                    <div className="px-4 pb-4">
                        <p className={"font-bold"}>Dewasa</p>
                        <table className="w-full border-collapse mb-4">
                            <tbody>
                            {dewasaData.map((person) => (
                                <tr key={person.nama}>
                                    <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.nama}</td>
                                    <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.telp}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <p className={"font-bold"}>Anak-anak</p>
                        <table className="w-full border-collapse">
                            <tbody>
                            {anakData.map((person) => (
                                <tr key={person.nama}>
                                    <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.nama}</td>
                                    <td className="border-b border-gray-200 p-2 lg:p-3 text-[14px] lg:text-[16px]">{person.tgl_lahir}</td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>

        {showConfirmation && (
            <div className="fixed inset-0 z-10 overflow-y-auto bg-gray-500 bg-opacity-50 flex justify-center items-center">
                <div className="bg-white p-8 rounded-md shadow-md w-[80%] lg:w-[50%]">
                    <p className="text-[12px] lg:text-[16px] font-semibold mb-7 text-justify">Apakah Anda yakin ingin melakukan pembayaran? Harap periksa kembali data yang anda masukkan, pastikan data tersebut sudah benar.</p>
                    <div className="flex justify-end">
                        <button onClick={() => handleKonfirmasiPembayaran(true)} className="px-4 py-2 bg-green-500 hover:bg-green-800 text-white rounded-md mr-4 text-[14px] lg:text-[18px]">Ya</button>
                        <button onClick={() => handleKonfirmasiPembayaran(false)} className="px-4 py-2 bg-red-500 hover:bg-red-800 text-white rounded-md text-[14px] lg:text-[18px]">Tidak</button>
                    </div>
                </div>
            </div>
        )}
    </div>

  );
};

export default Order;
